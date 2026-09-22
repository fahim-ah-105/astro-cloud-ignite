import { Link } from "@tanstack/react-router";
import { t, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const exploreLinks = [
    { to: "/$locale/discover", label: copy.nav.discover },
    { to: "/$locale/most-requested", label: copy.nav.mostRequested },
    { to: "/$locale/reviews", label: copy.nav.reviews },
    { to: "/$locale/how-it-works", label: copy.nav.howItWorks },
  ] as const;

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {copy.brandShort}
            </span>
            <span className="text-base font-semibold text-foreground">{copy.brand}</span>
          </div>
          <h2 className="mt-4 text-sm font-semibold text-foreground">{copy.footer.sourcing}</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{copy.footer.sourcingBody}</p>
        </div>

        <nav aria-label={copy.nav.menu}>
          <h2 className="text-sm font-semibold text-foreground">{copy.nav.discover}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {exploreLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  params={{ locale }}
                  className="focus-on-brand text-muted-foreground hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-foreground">{copy.footer.support}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                to="/$locale/contact"
                params={{ locale }}
                className="focus-on-brand text-muted-foreground hover:text-primary"
              >
                {copy.contact.title}
              </Link>
            </li>
            <li>
              <Link
                to="/$locale/policies"
                params={{ locale }}
                className="focus-on-brand text-muted-foreground hover:text-primary"
              >
                {copy.footer.legal}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">{copy.footer.company}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{copy.footer.addressPending}</p>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {copy.brand}. {copy.footer.rights}
        </p>
      </div>
    </footer>
  );
}
