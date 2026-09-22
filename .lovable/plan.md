# Buy, Sell, Trade — Complete Design Build

One full design pass covering every page in the blueprint, Bangla and English, in a single build. Not split into phases. Pages are built with clearly labeled sample content; the look, copy, and structure are final-quality throughout.

## Design direction

Warm ivory canvas, deep forest-green actions, charcoal-green text, restrained warm-orange accent — the exact palette from section 7.2 of your blueprint:

- canvas `#f8f6ef`, surface `#ffffff`, ink `#172b24`, muted `#57645d`
- brand `#176b4b`, brand hover `#115138`, brand soft `#e7f1eb`
- warm `#b84a22`, warm soft `#fff0e4`, danger `#b42318`
- borders `#dce3dd`, control outlines `#7e9084`

Typography: Noto Sans with Noto Sans Bengali, self-hosted, `font-display: swap`. Bangla tested for conjuncts and wrapping; never uppercased or letter-spaced.

Feel: a trustworthy discovery club. Real product photography carries the visual weight on 4:3 card canvases, product never cropped. No gradient walls, no autoplay carousels, no countdown timers, no fake urgency, no marketplace clutter. Generous whitespace, 1rem card radius, one soft shadow, 150–220ms transitions that respect reduced-motion.

Layout per section 7.3: 16px gutters and 2-column cards under 640px, 3 columns to 1023px, 4 columns and a 74rem container above; product detail splits 7/5 gallery to action panel on desktop, single column with one sticky action bar on mobile. 44px minimum touch targets, titles wrap rather than truncate.

## Every page, built in this pass

**Discovery and product**
- `/bn/`, `/en/` — launch-stage notice, hero, four-step how-it-works strip, community-featured grid, discover section with category chips, staff review tiles, recent batch updates, FAQ, full footer
- `/{locale}/discover` — search, filter drawer on mobile and sidebar on desktop, sort control, product grid, pagination
- `/{locale}/categories/{slug}` — crawlable category landing
- `/{locale}/products/{slug}` — gallery with video poster, availability and evidence badges, price with qualifier, variant selector, vote panel, reservation form, evidence panel with strengths and limitations, specifications, dated import timeline, state-specific delivery and cancellation copy, related products
- `/{locale}/most-requested` — vote-ranked list with interest progress toward the 100-vote goal
- `/{locale}/reviews` — staff demonstration, unboxing, tested, and supplier-media tiles with provenance labels

**Explanation and trust**
- `/{locale}/how-it-works`, `/{locale}/batches/{publicId}`, `/{locale}/contact`, `/{locale}/policies/{slug}` (terms, privacy, delivery, cancellation, returns and warranty)

**Account**
- `/{locale}/sign-in`, `/{locale}/saved`, `/{locale}/account` with my votes, free reservations, saved products, update subscriptions, profile

**Commerce screens (designed now, switched off)**
- `/{locale}/available-now`, `/{locale}/cart`, `/{locale}/checkout` with Bangladesh address fields, `/{locale}/account/orders/{id}` tracking

**Operational**
- `/admin` dashboard, product editor, campaign and threshold controls, import batch manager, moderation queue — layouts and states, noindex
- `/design-system` — every token, component variant, both languages, long-title and error and empty states, noindex

Root `/` redirects to `/bn/`. Commerce pages exist as finished designs but carry no live buy action; the `ordersEnabled` flag stays off, so nothing in the public navigation offers a purchase.

## Components

Button and icon button, input, select, checkbox, status badge, product card, price, interest progress, gallery and video tile, evidence panel, variant selector, reservation form, import timeline, filter drawer, toast, empty and error states, dialog, accordion, order summary — each with the full variant and state set from section 7.4, all shown on `/design-system`.

All eight public lifecycle states from section 5.2 are demonstrable on real cards: interest open, community-featured, import approved, on the way, in Bangladesh, arrived but ordering closed, sold out, paused or cancelled.

## Content honesty rules held throughout

- Sample content is labeled as sample; no invented reviews, shipments, registration numbers, or addresses
- "Vote" and "Free pre-order reservation" never phrased as an order; the no-payment explanation sits next to every action, not in an accordion
- Interest goal published at 100 accepted votes; reservation and procurement targets stay private
- No seven-day delivery promise appears anywhere outside a confirmed in-stock order screen

Accessibility target WCAG 2.2 AA: semantic landmarks, one H1 per page, visible focus rings including on brand surfaces, status never by colour alone, associated inline errors, zoom and reflow, reduced motion, real alt text.

## Technical notes

React on TanStack Start, server-rendered so product content is in the initial HTML and crawlable. A single semantic token layer in `src/styles.css` mirrors your `tokens.css` variables; no component hardcodes a colour. Locale is a route parameter with all copy in per-locale dictionaries, so translation is a data change. Sample content lives in one typed `src/data/fixtures/` module shaped to the section 11 data model.

Portability: tokens, copy dictionaries, component markup, and page structure carry over to Astro later; the routing wrapper and any future server calls would be rewritten against Firebase.

## Not included

Working sign-in, recorded votes and reservations, live admin writes, notifications, caching, image uploads, payments. This pass delivers the complete designed product; wiring it to real data and accounts is the next conversation.
