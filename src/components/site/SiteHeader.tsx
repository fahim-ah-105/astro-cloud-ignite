import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, User2, X } from "lucide-react";

import { useSession } from "@/hooks/useSession";
import { t, type Locale, otherLocale, localeName } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function useSwitchHref(locale: Locale) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const next = otherLocale(locale);
  return pathname.replace(/^\/(bn|en)/, `/${next}`) || `/${next}`;
}

export function SiteHeader({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);
  const switchHref = useSwitchHref(locale);

  const links = [
    { to: "/$locale/discover", label: copy.nav.discover },
    { to: "/$locale/most-requested", label: copy.nav.mostRequested },
    { to: "/$locale/reviews", label: copy.nav.reviews },
    { to: "/$locale/how-it-works", label: copy.nav.howItWorks },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link
          to="/$locale"
          params={{ locale }}
          className="focus-on-brand flex items-center gap-2"
          aria-label={copy.brand}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            {copy.brandShort}
          </span>
          <span className="hidden text-base font-semibold text-foreground sm:inline">{copy.brand}</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label={copy.nav.menu}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              params={{ locale }}
              activeProps={{ className: "bg-primary-soft text-primary" }}
              className="focus-on-brand rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/$locale/discover"
            params={{ locale }}
            className="focus-on-brand inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
            aria-label={copy.nav.search}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>

          <a
            href={switchHref}
            hrefLang={otherLocale(locale)}
            className="focus-on-brand hidden h-11 items-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:inline-flex"
          >
            {localeName(otherLocale(locale))}
          </a>

          {!loading && user ? (
            <Link
              to="/$locale/account"
              params={{ locale }}
              className="focus-on-brand inline-flex h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <User2 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{copy.nav.account}</span>
            </Link>
          ) : (
            <Link
              to="/$locale/auth"
              params={{ locale }}
              className="focus-on-brand inline-flex h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              {copy.nav.signIn}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={copy.nav.menu}
            className="focus-on-brand inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-border md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3" aria-label={copy.nav.menu}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              params={{ locale }}
              onClick={() => setOpen(false)}
              className="focus-on-brand rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/$locale/saved"
            params={{ locale }}
            onClick={() => setOpen(false)}
            className="focus-on-brand rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary"
          >
            {copy.nav.saved}
          </Link>
          <a
            href={switchHref}
            className="focus-on-brand rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary"
          >
            {localeName(otherLocale(locale))}
          </a>
        </nav>
      </div>
    </header>
  );
}
