import { createFileRoute } from "@tanstack/react-router";

import { normalizeLocale, t } from "@/lib/i18n";
import { StateBadge } from "@/components/site/StateBadge";
import type { PublicState } from "@/lib/lifecycle";

const STATES: PublicState[] = [
  "interest_open",
  "community_featured",
  "import_approved",
  "on_the_way",
  "in_bangladesh",
  "arrived_not_open",
  "sold_out",
  "paused",
];

export const Route = createFileRoute("/$locale/how-it-works")({
  component: HowItWorksPage,
  head: ({ params }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.howItWorks.title} — ${copy.brand}`;
    return {
      meta: [
        { title },
        { name: "description", content: copy.howItWorks.description },
        { property: "og:title", content: title },
        { property: "og:description", content: copy.howItWorks.description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function HowItWorksPage() {
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{copy.howItWorks.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.howItWorks.description}</p>
      </header>

      <ol className="mt-8 space-y-4">
        {copy.home.steps.map((step, index) => (
          <li key={step} className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-base font-semibold text-foreground">{step}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.home.stepsBody[index]}</p>
          </li>
        ))}
      </ol>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{copy.product.timelineTitle}</h2>
        <ul className="mt-4 space-y-3">
          {STATES.map((state) => (
            <li key={state} className="rounded-2xl border border-border bg-surface p-4">
              <StateBadge state={state} locale={locale} />
              <p className="mt-2 text-sm text-muted-foreground">{copy.stateNotes[state]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-primary-soft p-6">
        <h2 className="text-lg font-semibold text-primary">{copy.footer.sourcing}</h2>
        <p className="mt-2 text-sm text-foreground">{copy.footer.sourcingBody}</p>
        <p className="mt-3 text-sm text-foreground">{copy.commerce.deliveryPolicy}</p>
      </section>
    </div>
  );
}
