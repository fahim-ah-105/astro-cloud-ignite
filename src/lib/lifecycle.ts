export type PublicState =
  | "interest_open"
  | "community_featured"
  | "import_approved"
  | "on_the_way"
  | "in_bangladesh"
  | "arrived_not_open"
  | "sold_out"
  | "paused"
  | "cancelled";

export type CampaignState = "collecting" | "procurement_review" | "closed" | "paused" | "cancelled";
export type BatchState =
  | "proposed"
  | "approved"
  | "purchased"
  | "international_transit"
  | "customs"
  | "receiving"
  | "available"
  | "completed"
  | "cancelled";

export interface LifecycleInput {
  campaignState: CampaignState | null;
  communityFeatured: boolean;
  batchState: BatchState | null;
  localStock: number;
  ordersEnabled: boolean;
  hadStock?: boolean;
}

/** Single source of truth for the public label + primary action on a product. */
export function derivePublicState(input: LifecycleInput): PublicState {
  const { campaignState, communityFeatured, batchState, localStock, ordersEnabled } = input;

  if (campaignState === "cancelled" || batchState === "cancelled") return "cancelled";
  if (campaignState === "paused") return "paused";

  if (localStock > 0) return ordersEnabled ? "in_bangladesh" : "arrived_not_open";
  if (input.hadStock && localStock <= 0) return "sold_out";

  if (batchState === "available" || batchState === "receiving") return "arrived_not_open";
  if (batchState === "international_transit" || batchState === "customs") return "on_the_way";
  if (batchState === "approved" || batchState === "purchased") return "import_approved";

  if (communityFeatured) return "community_featured";
  return "interest_open";
}

export function canVote(state: PublicState, campaignState: CampaignState | null, interestEnabled: boolean) {
  if (!interestEnabled) return false;
  if (campaignState !== "collecting") return false;
  return state === "interest_open" || state === "community_featured";
}

export function canReserve(
  state: PublicState,
  campaignState: CampaignState | null,
  reservationsEnabled: boolean,
) {
  if (!reservationsEnabled) return false;
  if (campaignState !== "collecting" && campaignState !== "procurement_review") return false;
  return state === "interest_open" || state === "community_featured" || state === "import_approved";
}

export const STATE_TONE: Record<PublicState, "neutral" | "brand" | "warm" | "danger"> = {
  interest_open: "neutral",
  community_featured: "brand",
  import_approved: "brand",
  on_the_way: "warm",
  in_bangladesh: "brand",
  arrived_not_open: "warm",
  sold_out: "neutral",
  paused: "warm",
  cancelled: "danger",
};
