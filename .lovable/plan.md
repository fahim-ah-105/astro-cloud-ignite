# Buy, Sell, Trade — Phase 0: Design System & Static Pages

Scope: blueprint step 3 only. Shared design tokens, a component showcase, and page layouts built from clearly labeled local fixtures. No accounts, no database, no votes recorded. Bangla and English from day one.

## What you'll be able to see

- Every page of the storefront, in both Bangla and English, with realistic placeholder content
- A showcase page listing every colour, text size, button, badge, card and form state in one place
- Honest empty states: "no products yet", "no staff videos yet", "no batch updates yet"
- A language toggle that keeps you on the same page

## Pages built in this phase

| Route | Content |
| --- | --- |
| `/bn/`, `/en/` | Launch notice, hero, how-it-works strip, community-featured grid, discover, staff-review tiles, batch updates, FAQ |
| `/{locale}/discover` | Filter sidebar/drawer, sort control, product grid, pagination |
| `/{locale}/categories/{slug}` | Category landing with the same grid |
| `/{locale}/products/{slug}` | Gallery, availability + evidence badges, price with qualifier, vote panel, evidence panel, specs, timeline, related |
| `/{locale}/most-requested` | Vote-ranked list with interest progress |
| `/{locale}/reviews` | Staff demo / unboxing tiles with provenance labels |
| `/{locale}/how-it-works` | Vote → reserve → import review → buy explanation |
| `/{locale}/batches/{publicId}` | Dated import update timeline |
| `/{locale}/saved`, `/{locale}/account` | Logged-out and empty-state layouts |
| `/{locale}/sign-in` | Form layout only, not wired |
| `/{locale}/contact`, `/{locale}/policies/{slug}` | Support and policy templates |
| `/design-system` | Full token and component showcase, both languages, noindex |

Root `/` redirects to `/bn/`. Phase 2 commerce routes (cart, checkout, available-now, orders) are not built.

## Design direction

Warm ivory canvas, deep forest-green actions, charcoal-green text, restrained warm-orange accent — exactly the palette in the blueprint. Product photography carries the visual weight. 4:3 card canvases, product never cropped. No gradients, no fake urgency, no banner wall.

Typography: Noto Sans with Noto Sans Bengali, self-hosted, Bangla script tested for conjuncts and wrapping. No uppercase or letter-spacing on Bangla.

Breakpoints and spacing follow section 7.3: 2-column cards on phones, 3 on tablets, 4 on desktop; 44px minimum touch targets; product titles wrap instead of truncating.

## Components

Button, input/select/checkbox, status badge, product card, price, interest progress, gallery/video tile, evidence panel, variant selector, reservation form, import timeline, filter drawer, toast, empty/error state, dialog, accordion — each with the variants and states listed in section 7.4, all visible on `/design-system`.

Accessibility target WCAG 2.2 AA: semantic landmarks, one H1 per page, visible focus rings, status never conveyed by colour alone, reduced-motion support, real alt text.

## Content rules honoured in this phase

- Every product card and detail page is driven by a lifecycle state, so all eight public states from section 5.2 are demonstrable
- Fixture content is labeled as sample data so nothing reads as a real product, review, shipment, or price
- No "Buy now", no cart, no seven-day delivery promise anywhere, since commerce is off
- Interest goal shown as 100 accepted votes; reservation and procurement targets stay private

## Technical notes

Built on this workspace's stack: React with TanStack Start, server-rendered pages so product content is in the initial HTML and crawlable, Tailwind driven by a single semantic token layer in `src/styles.css` mirroring the blueprint's `tokens.css` variables. No component hardcodes a colour.

Locale is a route parameter (`src/routes/$locale/...`), with all copy in per-locale dictionary files so translation is a data change, not a code change. Fixtures live in one `src/data/fixtures/` folder, typed against the section 11 data model, so swapping them for a real backend later touches one boundary.

Portability note: because the entire data layer is a single typed fixtures module and the locale/copy layer is data, a later move to Astro + Express + Firebase would reuse the tokens, copy, component markup, and page structure; the routing wrapper and eventual server calls would be rewritten.

## Not in this phase

Sign-in, voting, reservations, admin tools, thresholds firing, notifications, caching, image uploads, payments. Those are Phase 1 and Phase 2, planned separately once you've approved the look.
