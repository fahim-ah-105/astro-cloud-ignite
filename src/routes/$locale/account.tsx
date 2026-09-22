import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { EmptyState } from "@/components/site/EmptyState";
import { normalizeLocale, t } from "@/lib/i18n";

export const Route = createFileRoute("/$locale/account")({
  ssr: false,
  component: AccountPage,
  head: ({ params }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.account.title} — ${copy.brand}`;
    return {
      meta: [
        { title },
        { name: "description", content: copy.auth.subtitle },
        { property: "og:title", content: title },
        { property: "og:description", content: copy.auth.subtitle },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function AccountPage() {
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);
  const { user, emailVerified } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const votes = useQuery({
    queryKey: ["my-votes", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("votes")
        .select("campaign_id, campaigns(products(slug, title_bn, title_en))");
      return data ?? [];
    },
  });

  const reservations = useQuery({
    queryKey: ["my-reservations", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("reservations")
        .select("id, quantity, status, campaigns(products(slug, title_bn, title_en))")
        .eq("status", "active");
      return data ?? [];
    },
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/$locale/auth", params: { locale }, replace: true });
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <EmptyState
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{copy.account.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="focus-on-brand inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-secondary"
        >
          {copy.nav.signOut}
        </button>
      </div>

      {!emailVerified ? (
        <p className="mt-4 rounded-xl bg-warm-soft px-4 py-3 text-sm font-medium text-warm">
          {copy.auth.verifyRequired}
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">{copy.account.votes}</h2>
        {votes.data?.length ? (
          <ul className="mt-3 space-y-2">
            {votes.data.map((row) => {
              const campaign = Array.isArray(row.campaigns) ? row.campaigns[0] : row.campaigns;
              const product = campaign
                ? Array.isArray(campaign.products)
                  ? campaign.products[0]
                  : campaign.products
                : null;
              if (!product) return null;
              return (
                <li key={row.campaign_id} className="rounded-xl border border-border bg-surface px-4 py-3">
                  <Link
                    to="/$locale/p/$slug"
                    params={{ locale, slug: product.slug }}
                    className="focus-on-brand text-sm font-medium text-foreground hover:text-primary"
                  >
                    {locale === "bn" ? product.title_bn : product.title_en}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState className="mt-3" title={copy.account.noVotes} />
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">{copy.account.reservations}</h2>
        {reservations.data?.length ? (
          <ul className="mt-3 space-y-2">
            {reservations.data.map((row) => {
              const campaign = Array.isArray(row.campaigns) ? row.campaigns[0] : row.campaigns;
              const product = campaign
                ? Array.isArray(campaign.products)
                  ? campaign.products[0]
                  : campaign.products
                : null;
              if (!product) return null;
              return (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <Link
                    to="/$locale/p/$slug"
                    params={{ locale, slug: product.slug }}
                    className="focus-on-brand text-sm font-medium text-foreground hover:text-primary"
                  >
                    {locale === "bn" ? product.title_bn : product.title_en}
                  </Link>
                  <span className="text-sm text-muted-foreground">× {row.quantity}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState className="mt-3" title={copy.account.noReservations} />
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">{copy.account.orders}</h2>
        <EmptyState className="mt-3" title={copy.account.noOrders} body={copy.commerce.disabledBody} />
      </section>
    </div>
  );
}
