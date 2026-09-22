import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { getBatch } from "@/lib/catalog.functions";
import { EmptyState } from "@/components/site/EmptyState";
import { normalizeLocale, t } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/$locale/batches/$publicId")({
  loader: async ({ params }) => {
    const data = await getBatch({ data: { publicId: params.publicId } });
    if (!data) throw notFound();
    return data;
  },
  component: BatchPage,
  head: ({ params, loaderData }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.batches.title} ${params.publicId} — ${copy.brand}`;
    const description = loaderData ? copy.footer.sourcingBody : copy.batches.empty;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function BatchPage() {
  const { batch, updates } = Route.useLoaderData();
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);
  const product = Array.isArray(batch.products) ? batch.products[0] : batch.products;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-muted-foreground">
        {copy.batches.title} · {batch.public_id}
      </p>
      {product ? (
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          <Link
            to="/$locale/p/$slug"
            params={{ locale, slug: product.slug }}
            className="focus-on-brand hover:text-primary"
          >
            {locale === "bn" ? product.title_bn : product.title_en}
          </Link>
        </h1>
      ) : null}

      <dl className="mt-6 grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">{copy.batches.expectedArrival}</dt>
          <dd className="text-sm font-semibold text-foreground">
            {batch.expected_arrival_from && batch.expected_arrival_to
              ? `${formatDate(batch.expected_arrival_from, locale)} – ${formatDate(batch.expected_arrival_to, locale)}`
              : copy.common.notAvailable}
          </dd>
        </div>
        {batch.delayed ? (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{copy.batches.delayed}</dt>
            <dd className="text-sm text-warm">
              {(locale === "bn" ? batch.delay_note_bn : batch.delay_note_en) ?? ""}
            </dd>
          </div>
        ) : null}
      </dl>

      {updates.length ? (
        <ol className="mt-8 space-y-4">
          {updates.map((update) => (
            <li key={update.id} className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs font-medium text-muted-foreground">
                {formatDate(update.event_date, locale)}
                {update.is_planned ? ` · ${copy.batches.planned}` : ""}
              </p>
              <h2 className="mt-1 text-base font-semibold text-foreground">
                {locale === "bn" ? update.title_bn : update.title_en}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {locale === "bn" ? update.body_bn : update.body_en}
              </p>
              {update.source_note ? (
                <p className="mt-2 text-xs text-muted-foreground">{update.source_note}</p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState className="mt-8" title={copy.batches.empty} />
      )}
    </div>
  );
}
