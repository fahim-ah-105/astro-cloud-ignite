import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { useEffect } from "react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { isLocale, normalizeLocale, t } from "@/lib/i18n";

export const Route = createFileRoute("/$locale")({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.locale)) throw notFound();
  },
  component: LocaleLayout,
  errorComponent: LocaleError,
});

function LocaleLayout() {
  const { locale: raw } = Route.useParams();
  const locale = normalizeLocale(raw);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="focus-on-brand sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t(locale).common.back}
      </a>
      <SiteHeader locale={locale} />
      <main id="main" className="flex-1">
        {/* Required: nested routes render here. */}
        <Outlet />
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}

function LocaleError({ error }: { error: Error }) {
  const { locale: raw } = Route.useParams();
  const copy = t(normalizeLocale(raw));
  console.error(error);
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-foreground">{copy.errors.loadTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{copy.errors.loadBody}</p>
    </div>
  );
}
