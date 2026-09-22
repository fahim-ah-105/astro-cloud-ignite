# Baishan Trade — Roadmap

## Foundation
- [ ] Enable Lovable Cloud (database, auth, storage)
- [ ] Design tokens in src/styles.css (ivory/forest-green palette, section 7.2)
- [ ] Noto Sans + Noto Sans Bengali fonts
- [ ] Locale routing (/bn, /en) + copy dictionaries
- [ ] Header, footer, shared layout
- [ ] Core components (button, badge, product card, price, progress, empty states)

## Database
- [ ] Schema: profiles, user_roles, products, variants, campaigns, votes, reservations, batches, batch_updates, reviews/evidence, subscriptions, settings/flags, audit_log, orders
- [ ] RLS on every table + grants
- [ ] has_role security-definer function

## Public pages
- [ ] Home
- [ ] Discover + filters/sort
- [ ] Category landing
- [ ] Product detail (gallery, evidence, vote, reservation, timeline)
- [ ] Most requested
- [ ] Reviews
- [ ] How it works
- [ ] Batch update page
- [ ] Contact, policies

## Accounts
- [ ] Email/password + Google sign-in, email verification gate
- [ ] Account: votes, reservations, saved, subscriptions, profile
- [ ] Saved products

## Interactions
- [ ] Voting (one per account, set-state, withdraw, rate limits)
- [ ] Reservations (variant, qty cap 3, edit/cancel)
- [ ] Threshold at 100 votes -> community-featured + staff notification

## Admin
- [ ] Dashboard + demand export
- [ ] Product editor + image upload
- [ ] Campaign/threshold controls
- [ ] Import batch manager + dated updates
- [ ] Moderation queue, audit log

## Commerce (ordersEnabled off)
- [ ] Available now, cart, checkout (BD address), order tracking
- [ ] BLOCKED: payment method decision (COD only vs SSLCOMMERZ credentials)

## Cross-cutting
- [ ] Notifications (email: goal reached, batch updates, stock arrived, cancelled)
- [ ] Server-side caching of public catalogue reads
- [ ] Feature flags: interestEnabled, reservationsEnabled, ordersEnabled, paidPreordersEnabled, demoMode
- [ ] Head metadata per route
- [ ] Sample products covering all 8 lifecycle states
