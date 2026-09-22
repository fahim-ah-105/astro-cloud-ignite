import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_RESERVATION_QTY = 3;
const VOTE_RATE_LIMIT = 20; // accepted vote writes per account per hour

function isVerified(claims: unknown) {
  const c = claims as
    | { email_verified?: boolean; user_metadata?: { email_verified?: boolean } }
    | undefined;
  return Boolean(c?.email_verified ?? c?.user_metadata?.email_verified);
}

/**
 * Reaching the interest goal notifies staff for import review. It purchases
 * nothing and charges nobody. Counters themselves are maintained by database
 * triggers, so this only queues the one-time staff notification.
 */
async function notifyIfGoalReached(campaignId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: campaign } = await supabaseAdmin
    .from("campaigns")
    .select("id, vote_count, community_featured, feature_goal_reached_at, products(title_en, slug)")
    .eq("id", campaignId)
    .maybeSingle();
  if (!campaign?.community_featured) return;

  const kind = `interest_goal_reached:${campaignId}`;
  const { count } = await supabaseAdmin
    .from("notification_outbox")
    .select("id", { count: "exact", head: true })
    .eq("kind", kind);
  if ((count ?? 0) > 0) return;

  const product = Array.isArray(campaign.products) ? campaign.products[0] : campaign.products;
  await supabaseAdmin.from("notification_outbox").insert({
    kind,
    subject: `Interest goal reached: ${product?.title_en ?? campaignId}`,
    body: `Campaign ${campaignId} reached ${campaign.vote_count} votes and is now community-featured. Import review is pending; nothing has been purchased.`,
  });
}

/** Everything the product page needs to render the signed-in user's own state. */
export const getMyProductState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ productId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: campaign }, { data: saved }] = await Promise.all([
      supabase.from("campaigns").select("id").eq("product_id", data.productId).maybeSingle(),
      supabase
        .from("saved_products")
        .select("product_id")
        .eq("product_id", data.productId)
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    let hasVoted = false;
    let subscribed = false;
    let reservations: { id: string; variant_id: string | null; quantity: number; status: string }[] = [];

    if (campaign) {
      const [{ data: vote }, { data: rows }, { data: sub }] = await Promise.all([
        supabase.from("votes").select("id").eq("campaign_id", campaign.id).eq("user_id", userId).maybeSingle(),
        supabase
          .from("reservations")
          .select("id, variant_id, quantity, status")
          .eq("campaign_id", campaign.id)
          .eq("user_id", userId)
          .eq("status", "active"),
        supabase
          .from("campaign_subscriptions")
          .select("campaign_id")
          .eq("campaign_id", campaign.id)
          .eq("user_id", userId)
          .maybeSingle(),
      ]);
      hasVoted = Boolean(vote);
      reservations = rows ?? [];
      subscribed = Boolean(sub);
    }

    return { hasVoted, reservations, saved: Boolean(saved), subscribed };
  });

/** Set-state, never a toggle: the client states what the vote should become. */
export const setVote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ campaignId: z.string().uuid(), voted: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    if (!isVerified(claims)) return { ok: false as const, reason: "email_unverified" as const };

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, state")
      .eq("id", data.campaignId)
      .maybeSingle();
    if (!campaign) return { ok: false as const, reason: "not_found" as const };
    if (campaign.state !== "collecting") return { ok: false as const, reason: "closed" as const };

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);
    if ((count ?? 0) >= VOTE_RATE_LIMIT) return { ok: false as const, reason: "rate_limited" as const };

    if (data.voted) {
      const { error } = await supabase
        .from("votes")
        .upsert({ campaign_id: data.campaignId, user_id: userId }, { onConflict: "campaign_id,user_id" });
      if (error) return { ok: false as const, reason: "error" as const };
    } else {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("campaign_id", data.campaignId)
        .eq("user_id", userId);
      if (error) return { ok: false as const, reason: "error" as const };
    }

    await notifyIfGoalReached(data.campaignId);

    const { data: fresh } = await supabase
      .from("campaigns")
      .select("vote_count, community_featured")
      .eq("id", data.campaignId)
      .maybeSingle();

    return {
      ok: true as const,
      voted: data.voted,
      votes: fresh?.vote_count ?? 0,
      communityFeatured: fresh?.community_featured ?? false,
    };
  });

export const setReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        campaignId: z.string().uuid(),
        variantId: z.string().uuid().nullable().optional(),
        quantity: z.number().int().min(1).max(MAX_RESERVATION_QTY),
        subscribe: z.boolean().optional(),
        acknowledged: z.literal(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    if (!isVerified(claims)) return { ok: false as const, reason: "email_unverified" as const };

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, state")
      .eq("id", data.campaignId)
      .maybeSingle();
    if (!campaign) return { ok: false as const, reason: "not_found" as const };
    if (campaign.state !== "collecting" && campaign.state !== "procurement_review") {
      return { ok: false as const, reason: "closed" as const };
    }

    const { error } = await supabase.from("reservations").upsert(
      {
        campaign_id: data.campaignId,
        user_id: userId,
        variant_id: data.variantId ?? null,
        quantity: data.quantity,
        status: "active",
        acknowledged: true,
      },
      { onConflict: "campaign_id,variant_id,user_id" },
    );
    if (error) return { ok: false as const, reason: "error" as const };

    if (data.subscribe) {
      await supabase
        .from("campaign_subscriptions")
        .upsert({ campaign_id: data.campaignId, user_id: userId }, { onConflict: "user_id,campaign_id" });
    }

    return { ok: true as const };
  });

export const cancelReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ reservationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("reservations")
      .update({ status: "withdrawn" })
      .eq("id", data.reservationId)
      .eq("user_id", userId);
    if (error) return { ok: false as const, reason: "error" as const };
    return { ok: true as const };
  });

export const setSaved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ productId: z.string().uuid(), saved: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.saved) {
      await supabase
        .from("saved_products")
        .upsert({ product_id: data.productId, user_id: userId }, { onConflict: "user_id,product_id" });
    } else {
      await supabase.from("saved_products").delete().eq("product_id", data.productId).eq("user_id", userId);
    }
    return { ok: true as const, saved: data.saved };
  });

export const setSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ campaignId: z.string().uuid(), subscribed: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.subscribed) {
      await supabase
        .from("campaign_subscriptions")
        .upsert({ campaign_id: data.campaignId, user_id: userId }, { onConflict: "user_id,campaign_id" });
    } else {
      await supabase
        .from("campaign_subscriptions")
        .delete()
        .eq("campaign_id", data.campaignId)
        .eq("user_id", userId);
    }
    return { ok: true as const, subscribed: data.subscribed };
  });
