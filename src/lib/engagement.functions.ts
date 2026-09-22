import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_RESERVATION_QTY = 3;
const VOTE_RATE_LIMIT = 20; // accepted vote writes per account per hour

/** Everything the product page needs to render the signed-in user's own state. */
export const getMyProductState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ productId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: campaign }, { data: saved }, { data: subscription }] = await Promise.all([
      supabase.from("campaigns").select("id").eq("product_id", data.productId).maybeSingle(),
      supabase
        .from("saved_products")
        .select("product_id")
        .eq("product_id", data.productId)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("campaign_subscriptions")
        .select("product_id")
        .eq("product_id", data.productId)
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    let hasVoted = false;
    let reservations: {
      id: string;
      variant_id: string | null;
      quantity: number;
      status: string;
    }[] = [];

    if (campaign) {
      const [{ data: vote }, { data: rows }] = await Promise.all([
        supabase
          .from("votes")
          .select("id")
          .eq("campaign_id", campaign.id)
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("reservations")
          .select("id, variant_id, quantity, status")
          .eq("campaign_id", campaign.id)
          .eq("user_id", userId)
          .eq("status", "active"),
      ]);
      hasVoted = Boolean(vote);
      reservations = rows ?? [];
    }

    return {
      hasVoted,
      reservations,
      saved: Boolean(saved),
      subscribed: Boolean(subscription),
    };
  });

async function refreshCampaignCounts(campaignId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ count: voteCount }, { data: reservationRows }, { data: campaign }] = await Promise.all([
    supabaseAdmin.from("votes").select("id", { count: "exact", head: true }).eq("campaign_id", campaignId),
    supabaseAdmin
      .from("reservations")
      .select("user_id")
      .eq("campaign_id", campaignId)
      .eq("status", "active"),
    supabaseAdmin
      .from("campaigns")
      .select("id, product_id, feature_vote_target, community_featured, feature_goal_reached_at")
      .eq("id", campaignId)
      .maybeSingle(),
  ]);

  if (!campaign) return;

  const votes = voteCount ?? 0;
  const reservingAccounts = new Set((reservationRows ?? []).map((r) => r.user_id)).size;
  const reachedGoal = votes >= (campaign.feature_vote_target ?? 100);
  const newlyFeatured = reachedGoal && !campaign.community_featured;

  await supabaseAdmin
    .from("campaigns")
    .update({
      vote_count: votes,
      reserving_accounts: reservingAccounts,
      community_featured: reachedGoal ? true : campaign.community_featured,
      feature_goal_reached_at:
        reachedGoal && !campaign.feature_goal_reached_at
          ? new Date().toISOString()
          : campaign.feature_goal_reached_at,
    })
    .eq("id", campaignId);

  if (newlyFeatured) {
    // Reaching the interest goal notifies staff for import review. It buys nothing.
    await supabaseAdmin.from("notification_outbox").insert({
      kind: "interest_goal_reached",
      audience: "staff",
      product_id: campaign.product_id,
      payload: { campaign_id: campaignId, votes },
    });
  }

  return { votes, reachedGoal };
}

/** Set-state, never a toggle: the client says what it wants the vote to be. */
export const setVote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ campaignId: z.string().uuid(), voted: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const verified = Boolean(
      (claims as { email_verified?: boolean; user_metadata?: { email_verified?: boolean } })
        ?.email_verified ??
        (claims as { user_metadata?: { email_verified?: boolean } })?.user_metadata?.email_verified,
    );
    if (!verified) return { ok: false as const, reason: "email_unverified" as const };

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

    const counts = await refreshCampaignCounts(data.campaignId);
    return { ok: true as const, voted: data.voted, votes: counts?.votes ?? 0 };
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
        productId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const verified = Boolean(
      (claims as { email_verified?: boolean })?.email_verified ??
        (claims as { user_metadata?: { email_verified?: boolean } })?.user_metadata?.email_verified,
    );
    if (!verified) return { ok: false as const, reason: "email_unverified" as const };

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
      },
      { onConflict: "campaign_id,variant_id,user_id" },
    );
    if (error) return { ok: false as const, reason: "error" as const };

    if (data.subscribe) {
      await supabase
        .from("campaign_subscriptions")
        .upsert({ product_id: data.productId, user_id: userId }, { onConflict: "product_id,user_id" });
    }

    await refreshCampaignCounts(data.campaignId);
    return { ok: true as const };
  });

export const cancelReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ reservationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("reservations")
      .select("id, campaign_id")
      .eq("id", data.reservationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!row) return { ok: false as const, reason: "not_found" as const };

    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("user_id", userId);
    if (error) return { ok: false as const, reason: "error" as const };

    await refreshCampaignCounts(row.campaign_id);
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
        .upsert({ product_id: data.productId, user_id: userId }, { onConflict: "product_id,user_id" });
    } else {
      await supabase
        .from("saved_products")
        .delete()
        .eq("product_id", data.productId)
        .eq("user_id", userId);
    }
    return { ok: true as const, saved: data.saved };
  });

export const setSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ productId: z.string().uuid(), subscribed: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.subscribed) {
      await supabase
        .from("campaign_subscriptions")
        .upsert({ product_id: data.productId, user_id: userId }, { onConflict: "product_id,user_id" });
    } else {
      await supabase
        .from("campaign_subscriptions")
        .delete()
        .eq("product_id", data.productId)
        .eq("user_id", userId);
    }
    return { ok: true as const, subscribed: data.subscribed };
  });
