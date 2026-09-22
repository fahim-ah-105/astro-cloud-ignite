import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { getProduct } from "@/lib/catalog.functions";
import { ProductActions } from "@/components/site/ProductActions";
import { ProductCard, productState } from "@/components/site/ProductCard";
import { StateBadge, EvidenceBadge } from "@/components/site/StateBadge";
import { InterestProgress } from "@/components/site/InterestProgress";
import { PriceTag } from "@/components/site/PriceTag";
import { SectionHeading } from "@/components/site/EmptyState";
import { normalizeLocale, t } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/$locale/p/$slug")({
  loader: async ({ params }) => {
    const data = await getProduct({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  component: ProductPage,
  head: ({ params, loaderData }) => {
    const locale = normalizeLocale(params.locale);
    const copy = t(locale);
    const product = loaderData?.product;
    const title = product
      ? `${locale === "bn" ? product.titleBn : product.titleEn} — ${copy.brand}`
      : copy.brand;
    const description =
      (product ? (locale === "bn" ? product.summaryBn : product.summaryEn) : null) ?? copy.home.heroBody;
    const image = product?.heroImageUrl?.startsWith("https://") ? product.heroImageUrl : null;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
});

function ProductPage() {
  const data = Route.useLoaderData();
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);
  const { product, flags } = data;
  const state = productState(product, flags);
  const title = locale === "bn" ? product.titleBn : product.titleEn;
  const description = locale === "bn" ? data.descriptionBn : data.descriptionEn;
  const priceNote = locale === "bn" ? data.priceNoteBn : data.priceNoteEn;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label={copy.product.breadcrumbHome} className="text-sm text-muted-foreground">
        <Link to="/$locale/discover" params={{ locale }} className="focus-on-brand hover:text-primary">
          {copy.product.breadcrumbHome}
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
            {product.heroImageUrl ? (
              <img src={product.heroImageUrl} alt={title} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-sm text-muted-foreground">
                {copy.common.notAvailable}
              </div>
            )}
          </div>

          {data.images.length ? (
            <ul className="mt-3 grid grid-cols-4 gap-3">
              {data.images.map((image: { id: string; url: string; alt_bn: string | null; alt_en: string | null; is_supplier_media: boolean }) => (
                <li key={image.id} className="overflow-hidden rounded-xl border border-border">
                  <img
                    src={image.url}
                    alt={(locale === "bn" ? image.alt_bn : image.alt_en) ?? title}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          <header className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <StateBadge state={state} locale={locale} />
              <EvidenceBadge evidence={product.evidence} locale={locale} />
              {product.isSample ? (
                <span className="rounded-full bg-warm-soft px-3 py-1 text-xs font-semibold text-warm">
                  {copy.common.sampleData}
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{copy.stateNotes[state]}</p>
          </header>

          {description ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground">{copy.product.aboutTitle}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </section>
          ) : null}

          {data.specs.length ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground">{copy.product.specsTitle}</h2>
              <dl className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
                {data.specs.map((spec, index) => (
                  <div key={index} className="flex gap-4 px-4 py-3 text-sm">
                    <dt className="w-1/3 font-medium text-muted-foreground">
                      {locale === "bn" ? spec.label_bn : spec.label_en}
                    </dt>
                    <dd className="flex-1 text-foreground">
                      {locale === "bn" ? spec.value_bn : spec.value_en}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-foreground">{copy.product.evidenceTitle}</h2>
            {data.reviews.length ? (
              <ul className="mt-3 space-y-4">
                {data.reviews.map(
                  (review: {
                    id: string;
                    kind: string;
                    reviewer_name: string | null;
                    reviewed_on: string | null;
                    conditions_bn: string | null;
                    conditions_en: string | null;
                    strengths_bn: string | null;
                    strengths_en: string | null;
                    limitations_bn: string | null;
                    limitations_en: string | null;
                  }) => (
                    <li key={review.id} className="rounded-2xl border border-border bg-surface p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        {copy.evidence[review.kind as keyof typeof copy.evidence] ?? copy.evidence.staff_demo}{" "}
                        · {review.reviewer_name} ·{" "}
                        {review.reviewed_on ? formatDate(review.reviewed_on, locale) : ""}
                      </p>
                      {(locale === "bn" ? review.conditions_bn : review.conditions_en) ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{copy.product.conditions}: </span>
                          {locale === "bn" ? review.conditions_bn : review.conditions_en}
                        </p>
                      ) : null}
                      {(locale === "bn" ? review.strengths_bn : review.strengths_en) ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{copy.product.strengths}: </span>
                          {locale === "bn" ? review.strengths_bn : review.strengths_en}
                        </p>
                      ) : null}
                      {(locale === "bn" ? review.limitations_bn : review.limitations_en) ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{copy.product.limitations}: </span>
                          {locale === "bn" ? review.limitations_bn : review.limitations_en}
                        </p>
                      ) : null}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-border bg-surface p-5">
                <h3 className="text-base font-semibold text-foreground">{copy.product.noEvidenceTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{copy.product.noEvidenceBody}</p>
              </div>
            )}
          </section>

          {data.timeline.length ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground">{copy.product.timelineTitle}</h2>
              <ol className="mt-3 space-y-3">
                {data.timeline.map(
                  (update: {
                    id: string;
                    event_date: string;
                    title_bn: string;
                    title_en: string;
                    body_bn: string | null;
                    body_en: string | null;
                    is_planned: boolean;
                  }) => (
                    <li key={update.id} className="rounded-2xl border border-border bg-surface p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatDate(update.event_date, locale)}
                        {update.is_planned ? ` · ${copy.batches.planned}` : ""}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-foreground">
                        {locale === "bn" ? update.title_bn : update.title_en}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {locale === "bn" ? update.body_bn : update.body_en}
                      </p>
                    </li>
                  ),
                )}
              </ol>
            </section>
          ) : null}
        </div>

        {/* Action rail */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <PriceTag
              estimated={product.estimatedPrice}
              final={product.finalPrice}
              locale={locale}
              size="lg"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {product.finalPrice === null ? copy.price.estimatedNote : copy.price.deliverySeparate}
            </p>
            {priceNote ? <p className="mt-2 text-xs text-muted-foreground">{priceNote}</p> : null}

            {product.campaign ? (
              <div className="mt-5">
                <InterestProgress
                  votes={product.campaign.voteCount}
                  target={product.campaign.featureVoteTarget}
                  showTarget={product.campaign.publishVoteTarget}
                  goalReached={product.campaign.communityFeatured}
                  locale={locale}
                />
              </div>
            ) : null}
          </div>

          <ProductActions
            productId={product.id}
            campaignId={product.campaign?.id ?? null}
            campaignState={product.campaign?.state ?? null}
            state={state}
            variants={data.variants}
            flags={flags}
            locale={locale}
          />

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-base font-semibold text-foreground">{copy.product.supportTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.product.supportBody}</p>
            <Link
              to="/$locale/contact"
              params={{ locale }}
              className="focus-on-brand mt-3 inline-flex min-h-11 items-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              {copy.product.contactSupport}
            </Link>
          </div>
        </aside>
      </div>

      {data.related.length ? (
        <section className="mt-16">
          <SectionHeading title={copy.product.relatedTitle} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.related.map((related) => (
              <ProductCard key={related.id} product={related} flags={flags} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
