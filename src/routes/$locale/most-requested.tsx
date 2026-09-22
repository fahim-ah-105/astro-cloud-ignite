import { createFileRoute, Link } from "@tanstack/react-router";

import { getMostRequested, getFlags } from "@/lib/catalog.functions";
import { EmptyState } from "@/components/site/EmptyState";
import { InterestProgress } from "@/components/site/InterestProgress";
import { StateBadge } from "@/components/site/StateBadge";
import { productState } from "@/components/site/ProductCard";
import { normalizeLocale, t } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/$locale/most-requested")({
  loader: async () => {
    const [data, flags] = await Promise.all([getMostRequested(), getFlags()]);
    return { ...data, flags };
  },
  component: MostRequestedPage,
  head: ({ params }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.mostRequested.title} — ${copy.brand}`;
    return {
      meta: [
        { title },
        { name: "description", content: copy.mostRequested.description },
        { property: "og:title", content: title },
        { property: "og:description", content: copy.mostRequested.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function MostRequestedPage() {
  const { items, flags } = Route.useLoaderData();
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{copy.mostRequested.title}</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">{copy.mostRequested.description}</p>
      </header>

      {items.length ? (
        <ol className="mt-8 space-y-3">
          {items.map((product, index) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-foreground">
                {formatNumber(index + 1, locale)}
              </span>
              <div className="min-w-[12rem] flex-1">
                <Link
                  to="/$locale/p/$slug"
                  params={{ locale, slug: product.slug }}
                  className="focus-on-brand text-base font-semibold text-foreground hover:text-primary"
                >
                  {locale === "bn" ? product.titleBn : product.titleEn}
                </Link>
                <div className="mt-2">
                  <StateBadge state={productState(product, flags)} locale={locale} />
                </div>
              </div>
              <div className="w-full sm:w-56">
                <InterestProgress
                  votes={product.campaign?.voteCount ?? 0}
                  target={product.campaign?.featureVoteTarget ?? 100}
                  showTarget={product.campaign?.publishVoteTarget ?? true}
                  goalReached={product.campaign?.communityFeatured ?? false}
                  locale={locale}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState className="mt-8" title={copy.mostRequested.empty} />
      )}
    </div>
  );
}
