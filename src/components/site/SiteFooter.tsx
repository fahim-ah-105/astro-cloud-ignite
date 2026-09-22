import { Link } from "@tanstack/react-router";
import { t, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = t(locale);
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
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{copy.footer.about}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">{copy.footer.explore}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/$locale/discover" params={{ locale }} className="focus-on-brand text-muted-foreground hover:text-primary">
                {copy.nav.discover}
              </Link>
            </li>
            <li>
              <Link to="/$locale/most-requested" params={{ locale }} className="focus-on-brand text-muted-foreground hover:text-primary">
                {copy.nav.mostRequested}
              </Link>
            </li>
            <li>
              <Link to="/$locale/reviews" params={{ locale }} className="focus-on-brand text-muted-foreground hover:text-primary">
                {copy.nav.reviews}
              </Link>
            </li>
            <li>
              <Link to="/$locale/how-it-works" params={{ locale }} className="focus-on-brand text-muted-foreground hover:text-primary">
                {copy.nav.howItWorks}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">{copy.footer.policies}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/$locale/policies" params={{ locale }} className="focus-on-brand text-muted-foreground hover:text-primary">
                {copy.footer.policiesLink}
              </Link>
            </li>
            <li>
              <Link to="/$locale/contact" params={{ locale }} className="focus-on-brand text-muted-foreground hover:text-primary">
                {copy.footer.contact}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">{copy.footer.noPaymentTitle}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{copy.footer.noPaymentBody}</p>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">{copy.footer.legal}</p>
      </div>
    </footer>
  );
}
