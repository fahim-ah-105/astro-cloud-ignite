import { createFileRoute } from "@tanstack/react-router";

import { normalizeLocale, t } from "@/lib/i18n";

export const Route = createFileRoute("/$locale/policies")({
  component: PoliciesPage,
  head: ({ params }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.policies.title} — ${copy.brand}`;
    const description = copy.footer.sourcingBody;
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

function PoliciesPage() {
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);

  const sections = [
    { id: "no-payment", title: copy.product.reserveTitle, body: copy.product.reserveHelp },
    { id: "pricing", title: copy.price.estimated, body: copy.price.estimatedNote },
    { id: "delivery", title: copy.commerce.checkout, body: copy.commerce.deliveryPolicy },
    { id: "sourcing", title: copy.footer.sourcing, body: copy.footer.sourcingBody },
    { id: "company", title: copy.footer.company, body: copy.footer.addressPending },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{copy.policies.title}</h1>

      <nav aria-label={copy.policies.title} className="mt-6 flex flex-wrap gap-2">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="focus-on-brand inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-secondary"
          >
            {section.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
