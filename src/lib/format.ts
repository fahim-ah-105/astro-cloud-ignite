import type { Locale } from "./i18n";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toLocaleDigits(value: string, locale: Locale): string {
  if (locale !== "bn") return value;
  return value.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]!);
}

export function formatNumber(value: number, locale: Locale): string {
  return toLocaleDigits(new Intl.NumberFormat("en-US").format(value), locale);
}

/** BDT amount, never rounded away silently. */
export function formatBdt(value: number | string | null | undefined, locale: Locale): string | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return null;
  const body = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  return `৳${toLocaleDigits(body, locale)}`;
}

export function formatDate(value: string | Date | null | undefined, locale: Locale): string | null {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  const body = new Intl.DateTimeFormat(locale === "bn" ? "en-GB" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
  return toLocaleDigits(body, locale);
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}
