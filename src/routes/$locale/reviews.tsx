import { createFileRoute, Link } from "@tanstack/react-router";

import { getReviews } from "@/lib/catalog.functions";
import { EmptyState } from "@/components/site/EmptyState";
import { normalizeLocale, t } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/$locale/reviews")({
  loader: () => getReviews(),
  component: ReviewsPage,
  head: ({ params }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.reviews.title} — ${copy.brand}`;
    return {
      meta: [
        { title },
        { name: "description", content: copy.reviews.description },
        { property: "og:title", content: title },
        { property: "og:description", content: copy.reviews.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function ReviewsPage() {
  const { items } = Route.useLoaderData();
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{copy.reviews.title}</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">{copy.reviews.description}</p>
      </header>

      {items.length ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {items.map((review) => {
            const product = Array.isArray(review.products) ? review.products[0] : review.products;
            const strengths = locale === "bn" ? review.strengths_bn : review.strengths_en;
            const limitations = locale === "bn" ? review.limitations_bn : review.limitations_en;
            return (
              <li key={review.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                {review.poster_url ? (
                  <img
                    src={review.poster_url}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                ) : null}
                <div className="space-y-3 p-5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {copy.evidence[review.kind as keyof typeof copy.evidence] ?? copy.evidence.staff_demo}
                  </p>
                  {product ? (
                    <Link
                      to="/$locale/p/$slug"
                      params={{ locale, slug: product.slug }}
                      className="focus-on-brand block text-lg font-semibold text-foreground hover:text-primary"
                    >
                      {locale === "bn" ? product.title_bn : product.title_en}
                    </Link>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    {copy.reviews.reviewer}: {review.reviewer_name}
                    {review.reviewer_role ? ` (${review.reviewer_role})` : ""} · {copy.reviews.reviewedOn}{" "}
                    {formatDate(review.reviewed_on, locale)}
                  </p>
                  {review.sample_variant ? (
                    <p className="text-sm text-muted-foreground">
                      {copy.reviews.sample}: {review.sample_variant}
                    </p>
                  ) : null}
                  {strengths ? (
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">{copy.product.strengths}</h2>
                      <p className="text-sm text-muted-foreground">{strengths}</p>
                    </div>
                  ) : null}
                  {limitations ? (
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">{copy.product.limitations}</h2>
                      <p className="text-sm text-muted-foreground">{limitations}</p>
                    </div>
                  ) : null}
                  {review.sponsored ? (
                    <p className="rounded-lg bg-warm-soft px-3 py-2 text-xs font-medium text-warm">
                      {copy.reviews.sponsored}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState className="mt-8" title={copy.reviews.empty} body={copy.home.reviewsEmpty} />
      )}
    </div>
  );
}
