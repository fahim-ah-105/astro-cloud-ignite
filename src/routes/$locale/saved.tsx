import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { EmptyState } from "@/components/site/EmptyState";
import { normalizeLocale, t } from "@/lib/i18n";

export const Route = createFileRoute("/$locale/saved")({
  ssr: false,
  component: SavedPage,
  head: ({ params }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.account.saved} — ${copy.brand}`;
    return {
      meta: [
        { title },
        { name: "description", content: copy.account.noSaved },
        { property: "og:title", content: title },
        { property: "og:description", content: copy.account.noSaved },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function SavedPage() {
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);
  const { user } = useSession();

  const saved = useQuery({
    queryKey: ["saved", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_products")
        .select("product_id, products(slug, title_bn, title_en, hero_image_url)");
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{copy.account.saved}</h1>

      {!user ? (
        <EmptyState
          className="mt-8"
          title={copy.errors.signInRequired}
          action={
            <Link
              to="/$locale/auth"
              params={{ locale }}
              className="focus-on-brand inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {copy.nav.signIn}
            </Link>
          }
        />
      ) : saved.data?.length ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {saved.data.map((row) => {
            const product = Array.isArray(row.products) ? row.products[0] : row.products;
            if (!product) return null;
            return (
              <li key={row.product_id} className="rounded-2xl border border-border bg-surface p-4">
                <Link
                  to="/$locale/p/$slug"
                  params={{ locale, slug: product.slug }}
                  className="focus-on-brand font-semibold text-foreground hover:text-primary"
                >
                  {locale === "bn" ? product.title_bn : product.title_en}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState className="mt-8" title={copy.account.noSaved} />
      )}
    </div>
  );
}
