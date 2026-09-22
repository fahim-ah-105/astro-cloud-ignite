# Baishan Trade — Complete Build

The full product in one pass: every page designed and finished, plus working sign-in, real recorded votes and reservations, live admin tools, notifications, image uploads, and caching. Bangla and English throughout.

Brand name: **Baishan Trade** (replacing "Buy, Sell, Trade" in the blueprint). A compact "BT" mark for favicon and mobile; full name in header, footer, and accessible labels.

## Design direction

Warm ivory canvas, deep forest-green actions, charcoal-green text, restrained warm-orange accent — the palette from section 7.2:

canvas `#f8f6ef` · surface `#ffffff` · ink `#172b24` · muted `#57645d` · brand `#176b4b` · brand hover `#115138` · brand soft `#e7f1eb` · warm `#b84a22` · warm soft `#fff0e4` · danger `#b42318` · border `#dce3dd` · control outline `#7e9084`

Typography: Noto Sans with Noto Sans Bengali, self-hosted, `font-display: swap`, Bangla tested for conjuncts and wrapping, never uppercased or letter-spaced.

Feel: a trustworthy discovery club. Real product photography on 4:3 canvases, product never cropped. No gradient walls, no autoplay carousels, no countdown timers, no fake urgency. Generous whitespace, 1rem card radius, one soft shadow, 150–220ms motion that respects reduced-motion.

Layout per section 7.3: 2-column cards under 640px, 3 to 1023px, 4 above in a 74rem container; product detail 7/5 gallery-to-action on desktop, single column with one sticky action bar on mobile. 44px touch targets, titles wrap.

Accessibility target WCAG 2.2 AA: landmarks, one H1 per page, visible focus including on brand surfaces, status never by colour alone, associated inline errors, zoom and reflow, real alt text.

## Pages

**Discovery** — home, discover with filters and sort, category landings, product detail (gallery, evidence and availability badges, qualified price, variant selector, vote, reservation, evidence panel with strengths and limitations, specs, dated import timeline, related), most-requested ranking, staff reviews.

**Trust** — how it works, batch update pages, contact and complaint process, policies (terms, privacy, delivery, cancellation, returns and warranty).

**Account** — sign-in, saved products, account home with my votes, free reservations, update subscriptions, profile, order history.

**Commerce** — available now, cart, checkout with Bangladesh address fields (district, upazila/thana, street and landmark, `+880` phone), order tracking.

**Admin** — dashboard with demand metrics and CSV export, product editor with image upload, campaign and threshold controls, import batch manager, reservation and vote moderation, notification sender.

**Showcase** — `/design-system` with every token, component variant, both languages, long titles, error, loading, and empty states. Noindex.

Root `/` redirects to `/bn/`. All eight public lifecycle states from section 5.2 render on real cards.

## Working functionality

**Accounts** — email and password sign-in plus Google. Email verification required before a vote or reservation counts, matching your rule that anonymous accounts cannot vote. Profiles store display name, preferred language, and district. Staff and admin roles live in a separate roles table, never on the profile, so nobody can promote themselves.

**Voting** — one accepted vote per account per campaign, enforced in the database. Set-state rather than toggle, so a retried request never flips the result. Withdraw while voting is open. Per-account and per-window rate limits, plus an anomaly report in admin for suspicious bursts.

**Reservations** — signed-in, verified contact, chosen variant, quantity capped at 3 per SKU per account, explicit nonbinding acknowledgement. Editing replaces rather than duplicates. Self-service cancel, always allowed even when a campaign is paused. Unique reserving accounts, reservation records, and intended units tracked separately.

**Thresholds** — 100 accepted votes publishes the community-featured badge and records the moment it was reached; reservation and procurement targets stay private. Crossing a threshold notifies staff and never purchases anything. Ranking: votes, then reserving accounts, then time reached, then stable ID.

**Admin writes** — publish and hide products, edit campaigns and targets, move import batches through their states with dated public updates, moderate votes and reservations, export demand data. Every state change is server-validated and written to an audit log with who and when.

**Notifications** — email for batch updates, goal reached, import approved, stock arrived, and campaign cancelled. Subscription per campaign is separate from marketing consent, which stays off by default. Unsubscribe from the account page without contacting staff.

**Images** — admin uploads product and review media; originals stored privately, public derivatives served from CDN with responsive sizes.

**Caching** — public catalogue, category, and vote-count reads are cached server-side and invalidated on write, so popular pages stay fast on slow mobile connections.

**Feature flags** — `interestEnabled`, `reservationsEnabled`, `ordersEnabled`, `paidPreordersEnabled`, `demoMode` held server-side. Hiding a button never enables or disables a business action.

## Payments — decision needed

Checkout, cart, orders, delivery quotes, and COD flow are all built and working end to end. The money step is the open question: SSLCOMMERZ and bKash are not available as built-in integrations here, so I'd wire checkout to record the order and mark payment as pending, and either (a) launch with cash on delivery only, which needs no gateway, or (b) connect SSLCOMMERZ through its API once you have a merchant contract and credentials. Tell me which and I'll build to it. `ordersEnabled` stays off until you say otherwise.

## Technical notes

React on TanStack Start, server-rendered so catalogue content is in the initial HTML and crawlable. Lovable Cloud provides the database, authentication, file storage, and server code — no external accounts. Semantic design tokens live in `src/styles.css`; no component hardcodes a colour. Locale is a route parameter with copy in per-locale dictionaries. Database tables follow the section 11 model with row-level security on every table: public reads limited to published safe columns, writes scoped to the owning account, admin actions gated by the roles table.

Portability note: tokens, copy, component markup, and page structure port to Astro later; database, auth, and server code would be rewritten against Firebase.

## Starting content

The site launches with honest empty states — no invented products, reviews, shipments, prices, registration numbers, or addresses. I'll add a small set of clearly marked sample products so you can see every lifecycle state working; you replace them from the admin panel.
