import { formatBdt } from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Price is always qualified: estimated, final, or unknown. Never show a bare
 * number that could read as a confirmed price.
 */
export function PriceTag({
  estimated,
  final,
  locale,
  size = "md",
  className,
}: {
  estimated: number | null;
  final: number | null;
  locale: Locale;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const copy = t(locale);
  const value = final ?? estimated;
  const isFinal = final !== null;
  const text = formatBdt(value, locale);

  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  } as const;

  if (!text) {
    return (
      <p className={cn("font-medium text-muted-foreground", sizes[size], className)}>
        {copy.price.unknown}
      </p>
    );
  }

  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground">
        {isFinal ? copy.price.final : copy.price.estimated}
      </p>
      <p className={cn("font-semibold text-foreground", sizes[size])}>{text}</p>
    </div>
  );
}
