import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";

import { PriceTag } from "./PriceTag";
import { StateBadge, EvidenceBadge } from "./StateBadge";
import { InterestProgress } from "./InterestProgress";
import type { ProductCardData, FlagMap } from "@/lib/catalog.functions";
import { derivePublicState } from "@/lib/lifecycle";
import { t, type Locale } from "@/lib/i18n";

export function productState(product: ProductCardData, flags: FlagMap) {
  return derivePublicState({
    campaignState: (product.campaign?.state ?? null) as never,
    communityFeatured: product.campaign?.communityFeatured ?? false,
    batchState: product.batchState as never,
    localStock: product.localStock,
    ordersEnabled: flags.ordersEnabled,
  });
}

export function ProductCard({
  product,
  flags,
  locale,
}: {
  product: ProductCardData;
  flags: FlagMap;
  locale: Locale;
}) {
  const copy = t(locale);
  const state = productState(product, flags);
  const title = locale === "bn" ? product.titleBn : product.titleEn;
  const summary = locale === "bn" ? product.summaryBn : product.summaryEn;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md">
      <Link
        to="/$locale/p/$slug"
        params={{ locale, slug: product.slug }}
        className="focus-on-brand block"
        aria-label={title}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
          {product.heroImageUrl ? (
            <img
              src={product.heroImageUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs">{copy.common.notAvailable}</span>
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <StateBadge state={state} locale={locale} />
          </div>
          {product.isSample ? (
            <span className="absolute right-3 top-3 rounded-full bg-warm-soft px-2.5 py-1 text-xs font-semibold text-warm">
              {copy.common.sampleData}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link
            to="/$locale/p/$slug"
            params={{ locale, slug: product.slug }}
            className="focus-on-brand text-base font-semibold leading-snug text-foreground hover:text-primary"
          >
            {title}
          </Link>
          {summary ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{summary}</p>
          ) : null}
        </div>

        <EvidenceBadge evidence={product.evidence} locale={locale} className="self-start" />

        {product.campaign && (state === "interest_open" || state === "community_featured") ? (
          <InterestProgress
            votes={product.campaign.voteCount}
            target={product.campaign.featureVoteTarget}
            showTarget={product.campaign.publishVoteTarget}
            goalReached={state === "community_featured"}
            locale={locale}
          />
        ) : (
          <p className="text-xs text-muted-foreground">{copy.stateNotes[state]}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <PriceTag
            estimated={product.estimatedPrice}
            final={product.finalPrice}
            locale={locale}
            size="sm"
          />
          <Link
            to="/$locale/p/$slug"
            params={{ locale, slug: product.slug }}
            className="focus-on-brand inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-primary-soft hover:text-primary"
          >
            {copy.common.viewAll}
          </Link>
        </div>
      </div>
    </article>
  );
}
