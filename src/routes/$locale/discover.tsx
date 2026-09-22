import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { listProducts } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState } from "@/components/site/EmptyState";
import { normalizeLocale, t } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";

const searchSchema = z.object({
  q: z.string().max(80).optional(),
  category: z.string().max(80).optional(),
  evidence: z.string().max(40).optional(),
  sort: z.enum(["most_requested", "newest", "price_asc"]).optional(),
});

export const Route = createFileRoute("/$locale/discover")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    listProducts({
      data: {
        search: deps.q,
        category: deps.category,
        evidence: deps.evidence,
        sort: deps.sort,
      },
    }),
  component: DiscoverPage,
  head: ({ params }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.discover.title} — ${copy.brand}`;
    return {
      meta: [
        { title },
        { name: "description", content: copy.discover.description },
        { property: "og:title", content: title },
        { property: "og:description", content: copy.discover.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function DiscoverPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const locale = normalizeLocale(Route.useParams().locale);
  const navigate = useNavigate({ from: "/$locale/discover" });
  const copy = t(locale);

  const update = (patch: Record<string, string | undefined>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), params: { locale } });

  const evidenceOptions = ["staff_tested", "staff_demo", "staff_unboxing", "supplier_only"] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{copy.discover.title}</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">{copy.discover.description}</p>
      </header>

      <form
        className="mt-6 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => event.preventDefault()}
        role="search"
      >
        <div className="sm:col-span-2">
          <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
            {copy.discover.searchLabel}
          </label>
          <input
            id="q"
            type="search"
            defaultValue={search.q ?? ""}
            onChange={(event) => update({ q: event.target.value || undefined })}
            className="focus-on-brand mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          />
        </div>

        <div>
          <label htmlFor="category" className="text-xs font-medium text-muted-foreground">
            {copy.discover.category}
          </label>
          <select
            id="category"
            value={search.category ?? ""}
            onChange={(event) => update({ category: event.target.value || undefined })}
            className="focus-on-brand mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">{copy.discover.allCategories}</option>
            {data.categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {locale === "bn" ? category.name_bn : category.name_en}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="text-xs font-medium text-muted-foreground">
            {copy.discover.sort}
          </label>
          <select
            id="sort"
            value={search.sort ?? "most_requested"}
            onChange={(event) => update({ sort: event.target.value })}
            className="focus-on-brand mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="most_requested">{copy.discover.sortMostRequested}</option>
            <option value="newest">{copy.discover.sortNewest}</option>
            <option value="price_asc">{copy.discover.sortPriceAsc}</option>
          </select>
        </div>

        <fieldset className="sm:col-span-2 lg:col-span-4">
          <legend className="text-xs font-medium text-muted-foreground">{copy.discover.evidenceType}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {evidenceOptions.map((option) => {
              const active = search.evidence === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ evidence: active ? undefined : option })}
                  className={`focus-on-brand min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  {copy.evidence[option]}
                </button>
              );
            })}
          </div>
        </fieldset>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {formatNumber(data.items.length, locale)} {copy.discover.resultsCount}
      </p>

      {data.items.length ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((product) => (
            <ProductCard key={product.id} product={product} flags={data.flags} locale={locale} />
          ))}
        </div>
      ) : (
        <EmptyState className="mt-4" title={copy.discover.empty} />
      )}
    </div>
  );
}
