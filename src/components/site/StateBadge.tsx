import {
  CheckCircle2,
  Clock,
  PackageCheck,
  PauseCircle,
  Plane,
  Sparkles,
  Ban,
  ShoppingBag,
  Archive,
} from "lucide-react";
import type { PublicState } from "@/lib/lifecycle";
import { STATE_TONE } from "@/lib/lifecycle";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ICONS: Record<PublicState, typeof Clock> = {
  interest_open: Clock,
  community_featured: Sparkles,
  import_approved: CheckCircle2,
  on_the_way: Plane,
  in_bangladesh: ShoppingBag,
  arrived_not_open: PackageCheck,
  sold_out: Archive,
  paused: PauseCircle,
  cancelled: Ban,
};

const TONE_CLASS = {
  neutral: "bg-secondary text-secondary-foreground",
  brand: "bg-primary text-primary-foreground",
  warm: "bg-warm-soft text-warm",
  danger: "bg-destructive-soft text-destructive",
} as const;

export function StateBadge({
  state,
  locale,
  className,
}: {
  state: PublicState;
  locale: Locale;
  className?: string;
}) {
  const Icon = ICONS[state];
  const copy = t(locale);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        TONE_CLASS[STATE_TONE[state]],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {copy.states[state]}
    </span>
  );
}

export function EvidenceBadge({
  evidence,
  locale,
  className,
}: {
  evidence: string;
  locale: Locale;
  className?: string;
}) {
  const copy = t(locale);
  const label =
    copy.evidence[evidence as keyof typeof copy.evidence] ?? copy.evidence.supplier_only;
  const tested = evidence === "staff_tested";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tested ? "border-primary/40 bg-primary-soft text-primary" : "border-border bg-surface text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
