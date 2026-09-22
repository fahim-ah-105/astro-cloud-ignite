import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface FlagMap {
  interestEnabled: boolean;
  reservationsEnabled: boolean;
  ordersEnabled: boolean;
  paidPreordersEnabled: boolean;
  demoMode: boolean;
}

export interface ProductCardData {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string | null;
  summaryEn: string | null;
  heroImageUrl: string | null;
  estimatedPrice: number | null;
  finalPrice: number | null;
  evidence: string;
  localStock: number;
  isSample: boolean;
  isStaffPick: boolean;
  categorySlug: string | null;
  categoryBn: string | null;
  categoryEn: string | null;
  createdAt: string;
  campaign: {
    id: string;
    state: string;
    voteCount: number;
    featureVoteTarget: number;
    publishVoteTarget: boolean;
    communityFeatured: boolean;
    featureGoalReachedAt: string | null;
    reservingAccounts: number;
  } | null;
  batchState: string | null;
  batchPublicId: string | null;
}

const PRODUCT_SELECT = `
  id, slug, title_bn, title_en, summary_bn, summary_en, hero_image_url,
  estimated_price_bdt, final_price_bdt, evidence, local_stock, is_sample, is_staff_pick, created_at,
  categories ( slug, name_bn, name_en ),
  campaigns ( id, state, vote_count, feature_vote_target, publish_vote_target, community_featured, feature_goal_reached_at, reserving_accounts ),
  import_batches ( public_id, state, created_at )
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProduct(row: any): ProductCardData {
  const campaign = Array.isArray(row.campaigns) ? row.campaigns[0] : row.campaigns;
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const batches = (row.import_batches ?? []) as any[];
  const batch = [...batches].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
  return {
    id: row.id,
    slug: row.slug,
    titleBn: row.title_bn,
    titleEn: row.title_en,
    summaryBn: row.summary_bn,
    summaryEn: row.summary_en,
    heroImageUrl: row.hero_image_url,
    estimatedPrice: row.estimated_price_bdt === null ? null : Number(row.estimated_price_bdt),
    finalPrice: row.final_price_bdt === null ? null : Number(row.final_price_bdt),
    evidence: row.evidence,
    localStock: row.local_stock ?? 0,
    isSample: !!row.is_sample,
    isStaffPick: !!row.is_staff_pick,
    categorySlug: category?.slug ?? null,
    categoryBn: category?.name_bn ?? null,
    categoryEn: category?.name_en ?? null,
    createdAt: row.created_at,
    campaign: campaign
      ? {
          id: campaign.id,
          state: campaign.state,
          voteCount: campaign.vote_count ?? 0,
          featureVoteTarget: campaign.feature_vote_target ?? 100,
          publishVoteTarget: campaign.publish_vote_target ?? true,
          communityFeatured: !!campaign.community_featured,
          featureGoalReachedAt: campaign.feature_goal_reached_at,
          reservingAccounts: campaign.reserving_accounts ?? 0,
        }
      : null,
    batchState: batch?.state ?? null,
    batchPublicId: batch?.public_id ?? null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const getFlags = createServerFn({ method: "GET" }).handler(async (): Promise<FlagMap> => {
  const { publicDb } = await import("./public-db.server");
  const { data } = await publicDb().from("site_settings").select("key, value");
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return {
    interestEnabled: map["interestEnabled"] === true,
    reservationsEnabled: map["reservationsEnabled"] === true,
    ordersEnabled: map["ordersEnabled"] === true,
    paidPreordersEnabled: map["paidPreordersEnabled"] === true,
    demoMode: map["demoMode"] === true,
  };
});

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("./public-db.server");
  const db = publicDb();

  const [settings, products, categories, reviews, updates] = await Promise.all([
    db.from("site_settings").select("key, value"),
    db.from("products").select(PRODUCT_SELECT).eq("status", "published").limit(48),
    db.from("categories").select("slug, name_bn, name_en").order("sort_order"),
    db
      .from("reviews")
      .select("id, kind, product_id, reviewer_name, reviewed_on, poster_url, media_url, duration_seconds, products(slug, title_bn, title_en)")
      .order("reviewed_on", { ascending: false })
      .limit(6),
    db
      .from("batch_updates")
      .select("id, event_date, title_bn, title_en, body_bn, body_en, import_batches(public_id, products(slug, title_bn, title_en))")
      .order("event_date", { ascending: false })
      .limit(4),
  ]);

  const flagRows = settings.data ?? [];
  const flagMap: Record<string, unknown> = {};
  for (const row of flagRows) flagMap[row.key] = row.value;

  const all = (products.data ?? []).map(mapProduct);
  const featured = all
    .filter((p) => p.campaign?.communityFeatured)
    .sort(
      (a, b) =>
        (b.campaign?.voteCount ?? 0) - (a.campaign?.voteCount ?? 0) ||
        (b.campaign?.reservingAccounts ?? 0) - (a.campaign?.reservingAccounts ?? 0),
    )
    .slice(0, 8);

  return {
    flags: {
      interestEnabled: flagMap["interestEnabled"] === true,
      reservationsEnabled: flagMap["reservationsEnabled"] === true,
      ordersEnabled: flagMap["ordersEnabled"] === true,
      paidPreordersEnabled: flagMap["paidPreordersEnabled"] === true,
      demoMode: flagMap["demoMode"] === true,
    } as FlagMap,
    featured,
    latest: [...all].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 8),
    categories: categories.data ?? [],
    reviews: reviews.data ?? [],
    updates: updates.data ?? [],
    totalProducts: all.length,
  };
});

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().max(80).optional(),
        category: z.string().max(80).optional(),
        sort: z.enum(["most_requested", "newest", "price_asc"]).optional(),
        evidence: z.string().max(40).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { publicDb } = await import("./public-db.server");
    const db = publicDb();
    let query = db.from("products").select(PRODUCT_SELECT).eq("status", "published").limit(96);
    if (data.category) {
      const { data: cat } = await db.from("categories").select("id").eq("slug", data.category).maybeSingle();
      if (cat) query = query.eq("category_id", cat.id);
    }
    if (data.search) {
      const term = `%${data.search}%`;
      query = query.or(`title_en.ilike.${term},title_bn.ilike.${term}`);
    }
    if (data.evidence) query = query.eq("evidence", data.evidence as never);

    const [{ data: rows }, categories, settings] = await Promise.all([
      query,
      db.from("categories").select("slug, name_bn, name_en").order("sort_order"),
      db.from("site_settings").select("key, value"),
    ]);

    const flagMap: Record<string, unknown> = {};
    for (const row of settings.data ?? []) flagMap[row.key] = row.value;

    const items = (rows ?? []).map(mapProduct);
    const sort = data.sort ?? "most_requested";
    items.sort((a, b) => {
      if (sort === "newest") return a.createdAt < b.createdAt ? 1 : -1;
      if (sort === "price_asc") {
        const av = a.finalPrice ?? a.estimatedPrice ?? Number.MAX_SAFE_INTEGER;
        const bv = b.finalPrice ?? b.estimatedPrice ?? Number.MAX_SAFE_INTEGER;
        return av - bv;
      }
      return (b.campaign?.voteCount ?? 0) - (a.campaign?.voteCount ?? 0);
    });

    return {
      items,
      categories: categories.data ?? [],
      flags: {
        interestEnabled: flagMap["interestEnabled"] === true,
        reservationsEnabled: flagMap["reservationsEnabled"] === true,
        ordersEnabled: flagMap["ordersEnabled"] === true,
        paidPreordersEnabled: flagMap["paidPreordersEnabled"] === true,
        demoMode: flagMap["demoMode"] === true,
      } as FlagMap,
    };
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { publicDb } = await import("./public-db.server");
    const db = publicDb();
    const { data: row } = await db
      .from("products")
      .select(
        `${PRODUCT_SELECT}, description_bn, description_en, specs, price_note_bn, price_note_en,
         product_images ( id, url, alt_bn, alt_en, is_supplier_media, sort_order ),
         product_variants ( id, sku, name_bn, name_en, detail_bn, detail_en, price_bdt, local_stock, unavailable_reason_bn, unavailable_reason_en, sort_order ),
         reviews ( id, kind, reviewer_name, reviewer_role, reviewed_on, sample_variant, source_note, conditions_bn, conditions_en, strengths_bn, strengths_en, limitations_bn, limitations_en, media_url, poster_url, duration_seconds, sponsored )`,
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();

    if (!row) return null;

    const product = mapProduct(row);
    const batchIds = (row.import_batches ?? []).map((b: { public_id: string }) => b.public_id);
    const { data: timeline } = batchIds.length
      ? await db
          .from("batch_updates")
          .select("id, event_date, title_bn, title_en, body_bn, body_en, source_note, is_planned, import_batches!inner(public_id)")
          .in("import_batches.public_id", batchIds)
          .order("event_date", { ascending: false })
      : { data: [] };

    const { data: settings } = await db.from("site_settings").select("key, value");
    const flagMap: Record<string, unknown> = {};
    for (const s of settings ?? []) flagMap[s.key] = s.value;

    const { data: related } = await db
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "published")
      .neq("slug", data.slug)
      .limit(4);

    return {
      product,
      descriptionBn: row.description_bn as string | null,
      descriptionEn: row.description_en as string | null,
      priceNoteBn: row.price_note_bn as string | null,
      priceNoteEn: row.price_note_en as string | null,
      specs: (row.specs ?? []) as { label_bn: string; label_en: string; value_bn: string; value_en: string }[],
      images: (row.product_images ?? []).sort(
        (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
      ),
      variants: (row.product_variants ?? []).sort(
        (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
      ),
      reviews: row.reviews ?? [],
      timeline: timeline ?? [],
      related: (related ?? []).map(mapProduct),
      flags: {
        interestEnabled: flagMap["interestEnabled"] === true,
        reservationsEnabled: flagMap["reservationsEnabled"] === true,
        ordersEnabled: flagMap["ordersEnabled"] === true,
        paidPreordersEnabled: flagMap["paidPreordersEnabled"] === true,
        demoMode: flagMap["demoMode"] === true,
      } as FlagMap,
    };
  });

export const getMostRequested = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("./public-db.server");
  const db = publicDb();
  const { data } = await db.from("products").select(PRODUCT_SELECT).eq("status", "published").limit(96);
  const items = (data ?? [])
    .map(mapProduct)
    .filter((p) => p.campaign)
    .sort(
      (a, b) =>
        (b.campaign?.voteCount ?? 0) - (a.campaign?.voteCount ?? 0) ||
        (b.campaign?.reservingAccounts ?? 0) - (a.campaign?.reservingAccounts ?? 0),
    );
  return { items };
});

export const getReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("./public-db.server");
  const { data } = await publicDb()
    .from("reviews")
    .select(
      "id, kind, reviewer_name, reviewer_role, reviewed_on, sample_variant, source_note, strengths_bn, strengths_en, limitations_bn, limitations_en, media_url, poster_url, duration_seconds, sponsored, products(slug, title_bn, title_en, hero_image_url)",
    )
    .order("reviewed_on", { ascending: false });
  return { items: data ?? [] };
});

export const getBatch = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ publicId: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { publicDb } = await import("./public-db.server");
    const db = publicDb();
    const { data: batch } = await db
      .from("import_batches")
      .select(
        "id, public_id, state, expected_arrival_from, expected_arrival_to, arrival_confidence, delayed, delay_note_bn, delay_note_en, products(slug, title_bn, title_en, hero_image_url)",
      )
      .eq("public_id", data.publicId)
      .maybeSingle();
    if (!batch) return null;
    const { data: updates } = await db
      .from("batch_updates")
      .select("id, event_date, title_bn, title_en, body_bn, body_en, source_note, is_planned")
      .eq("batch_id", batch.id)
      .order("event_date", { ascending: false });
    return { batch, updates: updates ?? [] };
  });

export const getCategory = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { publicDb } = await import("./public-db.server");
    const db = publicDb();
    const { data: category } = await db
      .from("categories")
      .select("slug, name_bn, name_en, description_bn, description_en, id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!category) return null;
    const { data: rows } = await db
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "published")
      .eq("category_id", category.id)
      .limit(96);
    return { category, items: (rows ?? []).map(mapProduct) };
  });
