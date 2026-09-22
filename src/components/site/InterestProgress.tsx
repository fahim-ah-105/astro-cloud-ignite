import { formatNumber, interpolate } from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";

/**
 * Named metric with numerator and public target. When the owner hides the
 * target, only the accepted-vote count is shown — no denominator, no percentage.
 */
export function InterestProgress({
  votes,
  target,
  showTarget,
  goalReached,
  locale,
}: {
  votes: number;
  target: number;
  showTarget: boolean;
  goalReached: boolean;
  locale: Locale;
}) {
  const copy = t(locale);
  const pct = showTarget ? Math.min(100, Math.round((votes / Math.max(target, 1)) * 100)) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{copy.product.interestGoal}</p>
        <p className="text-sm font-semibold text-foreground">
          {showTarget
            ? interpolate(copy.product.votesOf, {
                count: formatNumber(votes, locale),
                target: formatNumber(target, locale),
              })
            : interpolate(copy.product.votesOnly, { count: formatNumber(votes, locale) })}
        </p>
      </div>
      {showTarget ? (
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={votes}
          aria-valuemin={0}
          aria-valuemax={target}
          aria-label={copy.product.interestGoal}
        >
          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      ) : null}
      {goalReached ? (
        <p className="mt-2 text-xs font-medium text-primary">{copy.product.goalReached}</p>
      ) : null}
    </div>
  );
}
