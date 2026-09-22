import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Vote, PackageSearch, Truck } from "lucide-react";

import { getHomeData } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState, SectionHeading } from "@/components/site/EmptyState";
import { normalizeLocale, t } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/$locale/")({
  loader: () => getHomeData(),
  component: HomePage,
  head: ({ params }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.brand} — ${copy.tagline}`;
    return {
      meta: [
        { title },
        { name: "description", content: copy.home.heroBody },
        { property: "og:title", content: title },
        { property: "og:description", content: copy.home.heroBody },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

const STEP_ICONS = [PackageSearch, Vote, ShieldCheck, Truck];

function HomePage() {
  const data = Route.useLoaderData();
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);

  return (
    <div>
      {/* Launch notice */}
      <div className="border-b border-border bg-warm-soft">
        <p className="mx-auto max-w-6xl px-4 py-2.5 text-center text-sm font-medium text-warm">
          {copy.home.launchNotice}
        </p>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            {copy.home.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{copy.home.heroBody}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/$locale/discover"
              params={{ locale }}
              className="focus-on-brand inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              {copy.home.browse}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/$locale/how-it-works"
              params={{ locale }}
              className="focus-on-brand inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {copy.nav.howItWorks}
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {copy.home.steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? PackageSearch;
            return (
              <div key={step} className="rounded-2xl border border-border bg-background p-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{copy.home.stepsBody[i]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Community featured */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHeading title={copy.home.featuredTitle} description={copy.home.featuredNote} />
        {data.featured.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.featured.map((product) => (
              <ProductCard key={product.id} product={product} flags={data.flags} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={copy.home.featuredEmptyTitle}
            body={copy.home.featuredEmptyBody}
            action={
              <Link
                to="/$locale/discover"
                params={{ locale }}
                className="focus-on-brand inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                {copy.home.browse}
              </Link>
            }
          />
        )}
      </section>

      {/* Discover */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <SectionHeading
          title={copy.home.discoverTitle}
          action={
            <Link
              to="/$locale/discover"
              params={{ locale }}
              className="focus-on-brand inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-primary-soft"
            >
              {copy.common.viewAll}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
        {data.latest.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.latest.map((product) => (
              <ProductCard key={product.id} product={product} flags={data.flags} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState title={copy.home.noProductsTitle} body={copy.home.noProductsBody} />
        )}
      </section>

      {/* Reviews */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeading
            title={copy.home.reviewsTitle}
            action={
              <Link
                to="/$locale/reviews"
                params={{ locale }}
                className="focus-on-brand inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-primary-soft"
              >
                {copy.common.viewAll}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          {data.reviews.length ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.reviews.map((review) => {
                const product = Array.isArray(review.products) ? review.products[0] : review.products;
                return (
                  <li key={review.id} className="rounded-2xl border border-border bg-background p-5">
                    <p className="text-xs font-medium text-muted-foreground">
                      {copy.evidence[review.kind as keyof typeof copy.evidence] ?? copy.evidence.staff_demo}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-foreground">
                      {product ? (locale === "bn" ? product.title_bn : product.title_en) : ""}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.reviewer_name} · {formatDate(review.reviewed_on, locale)}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title={copy.home.reviewsTitle} body={copy.home.reviewsEmpty} />
          )}
        </div>
      </section>

      {/* Batch updates */}
      {data.updates.length ? (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeading title={copy.home.batchesTitle} />
          <ol className="space-y-4">
            {data.updates.map((update) => {
              const batch = Array.isArray(update.import_batches)
                ? update.import_batches[0]
                : update.import_batches;
              return (
                <li key={update.id} className="rounded-2xl border border-border bg-surface p-5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatDate(update.event_date, locale)}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">
                    {locale === "bn" ? update.title_bn : update.title_en}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {locale === "bn" ? update.body_bn : update.body_en}
                  </p>
                  {batch?.public_id ? (
                    <Link
                      to="/$locale/batches/$publicId"
                      params={{ locale, publicId: batch.public_id }}
                      className="focus-on-brand mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
                    >
                      {copy.product.viewBatch}
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
