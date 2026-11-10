# Bind Floral & Cake: online store

Bilingual (English and Arabic) online store for Bind Floral & Cake. This is the **first version**: a working storefront with cart and checkout on sample data. The full plan is in [`docs/SPEC.md`](docs/SPEC.md).

## What works now

- Home, shop (filter by category, occasion, colour; sort by price), product pages, cart, checkout, delivery information
- English and Arabic with right-to-left layout, under `/en` and `/ar`
- Size variants, add-ons, message on the cake, card message, anonymous sending
- Delivery or pickup, delivery areas with fees and free-delivery thresholds, date and time-slot rules (same-day cutoff, preparation time)
- Totals, discount code and delivery fee recalculated and validated on the server when the order is placed

## What is not built yet

- **Orders are not saved and no payment is taken.** Checkout validates the order and shows a confirmation with an order number, nothing more.
- No database, admin panel, customer accounts, notifications, subscriptions or bespoke quotes.
- Products, prices, delivery areas, fees and contact details are **samples** in `src/lib/data/`. Product pictures are drawn placeholders.

See `docs/DECISIONS.md` for choices made in this version and `docs/SPEC.md` section 12 for the remaining phases.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Other commands: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.

Copy `.env.example` to `.env.local` to set the shop's WhatsApp number, phone and email.

## Where things are

| Path | Contents |
|---|---|
| `src/lib/data/products.ts` | Sample catalogue |
| `src/lib/data/delivery.ts` | Sample delivery areas, fees, time slots, discount code |
| `src/lib/pricing.ts`, `src/lib/delivery.ts` | Totals and slot-availability rules (covered by `tests/`) |
| `src/lib/actions/checkout.ts` | Server-side order validation |
| `messages/en.json`, `messages/ar.json` | All interface text |
| `src/app/[locale]/` | Pages |
