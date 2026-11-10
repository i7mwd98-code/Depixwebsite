# Bind Flowers: Online Store Build Specification

You are building the full online store for **Bind Floral & Cake**, a flower shop in the UAE. This document is the complete brief. Read all of it before writing any code.

## 0. How to work

1. Build in the phases listed in section 12, in order. Do not start a phase until the previous one meets its acceptance criteria.
2. At the end of each phase: run lint, type check, tests and a production build, commit, then give me a short report (what was built, what was verified, what is still open) and wait for my go-ahead.
3. Before Phase 1, ask me everything in section 13 ("What I need from the owner") in one message. If I have not supplied something, use a clearly marked placeholder and carry on; never block on content.
4. Never hardcode secrets. Every key goes in `.env.local`, and every variable is listed in `.env.example` with a comment.
5. For every third-party API (Stripe, Tabby, Tamara, Ziina, Telr, WhatsApp, Resend), read the provider's current official documentation before integrating. Do not rely on memory for endpoints, fields or webhook formats.
6. Build each payment provider against its sandbox first. A provider goes live only when I add live keys and turn it on in admin settings.
7. If a decision is not covered here, choose the simplest option that fits the brief, note it in `docs/DECISIONS.md`, and continue.

## 1. Goal and scope

A fast, mobile-first, bilingual (English and Arabic) store where customers browse bouquets and gifts, choose a delivery date and time slot, write a card message, pay online, and track the order. The shop team runs everything from an admin panel: products, orders, delivery rules, payments, discounts and content.

**In scope:** storefront, cart and checkout, payments, order tracking, customer accounts, admin panel, notifications, SEO, analytics, and an integration API for later connection to Bind Manager (the shop's existing internal system).

**Out of scope for now:** native mobile apps, separate country sites, a multi-vendor marketplace, and direct integration with Bind Manager (only the API in section 10 is prepared).

### 1.1 Competitor benchmark

Two UAE competitors set the standard this store must match. Before Phase 1, open both sites yourself (home, a listing, a product page, the cart and checkout up to the payment step) and record what you see in `docs/COMPETITORS.md`; treat the table below as a starting point, not as verified detail.

| What they have | Bliss Flowers (uae.blissflowers.com) | Jays (jays.ae) | Bind |
|---|---|---|---|
| Product range | Bouquets, orchids, boxes, preserved flowers, gifts, partner collections with chocolate and fragrance brands | Flowers, cakes (creamy, fondant, signature), combos, trays, customised items | Flowers, cakes, add-ons, combos, partner collections |
| Flower formats | Bouquets, boxes, orchids | Bouquets, vases, bags | Format is a filter: bouquet, box, vase, bag, tray, orchid |
| Languages | English and Arabic | English (URLs under `/en`) | English and Arabic |
| Delivery | Same day across the UAE in three slots (8am to 12pm, 12pm to 5pm, 5pm to 10pm); extra fees for remote areas; some areas not served | Same day, scheduled and express across the UAE; "No address?" option | All set in admin (section 6) |
| Free delivery | Over AED 300; AED 50 surcharge below that | Over AED 500 | Threshold and small-order surcharge set in admin |
| Subscriptions | Weekly, every two weeks or monthly; skip or pause; free delivery | Not seen | Yes (section 4.4) |
| Bespoke orders | Not seen | Custom cake, flower or gift quote through WhatsApp | Yes (section 4.5) |
| Occasion collections | Baby reception, graduation, bestsellers, seasonal | Seasonal, for example Emirati Women's Day cakes, bouquets and trays | Yes, scheduled campaigns |
| Corporate gifting | Not confirmed | Yes | Enquiry form at launch |
| Mobile app | Not seen | iOS and Android | Installable web app (PWA) |
| Branches | Shops in Dubai and Abu Dhabi | Abu Dhabi, Dubai and Al Ain | Branch list set in admin |
| Other countries | Separate sites for Saudi Arabia and Kuwait | UAE only | UAE only |

Where Bind should be better than both: a faster mobile checkout, a clear delivery promise shown before checkout (date, slot and fee from the product page), the pre-delivery photo, and one consistent delivery policy across every page.

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript in strict mode |
| Styling | Tailwind CSS with logical properties so right-to-left works without duplicate styles |
| UI components | shadcn/ui (Radix based) |
| Database, auth, storage | Supabase (Postgres, Auth, Storage) with row level security on every table |
| Translations | next-intl, routes under `/en` and `/ar` |
| Validation | Zod on every form, server action and API route |
| Email | Resend with React Email templates in both languages |
| Payments | Stripe, Tabby, Tamara, Ziina, Telr behind one provider interface (section 7) |
| Hosting | Vercel for the app, Supabase cloud for data |
| Tests | Vitest for unit and integration tests, Playwright for end-to-end |
| Errors and analytics | Sentry; GA4 and Meta Pixel loaded only after cookie consent |

Use the Supabase CLI with SQL migrations committed to the repository. Generate TypeScript types from the schema.

## 3. Roles

| Role | Can do |
|---|---|
| Guest | Browse, add to cart, check out without an account, track an order by order number and phone |
| Customer | Everything a guest can, plus order history, saved addresses, saved occasions and reminders, wishlist |
| Staff | See and progress orders, print order tickets, upload the pre-delivery photo |
| Manager | Staff rights plus products, stock, discounts, content |
| Owner | Everything, including settings, payments, delivery rules, staff accounts, reports |

Admin roles are stored in a `staff_profiles` table and enforced by row level security and by server-side checks, never by the client alone.

## 4. Storefront

### 4.1 Pages

- **Home:** hero banner, occasion shortcuts, best sellers, new arrivals, same-day delivery countdown ("order in the next 2h 15m for delivery today"), reviews, Instagram strip, footer.
- **Category and occasion listings:** filters for price range, colour, flower type, occasion and same-day availability; sort by featured, price and newest; pagination or infinite scroll.
- **Search:** instant search over product names, flower types and tags in both languages.
- **Product page:** image gallery with zoom, size variants (for example Standard, Deluxe, Premium, each with its own price and image), description, what is included, care tips, substitution note, add-ons, delivery date check, related products, reviews.
- **Cart:** as a drawer and as a full page.
- **Checkout:** section 5.
- **Order confirmation and order tracking.**
- **Account:** profile, orders, addresses, occasion reminders, wishlist.
- **Content pages:** About, Contact (map, WhatsApp, phone, hours), Delivery information, FAQ, Flower care, Terms, Privacy, Refund and substitution policy, Corporate and events enquiry form, Wedding enquiry form.
- **404 and error pages** in both languages.

### 4.2 Flower-specific features

- **Add-ons at product and cart level:** cakes, chocolates, balloons, vases, greeting cards, teddy bears. Add-ons are ordinary products flagged as add-ons.
- **Card message:** free text with a character limit, a set of suggested messages per occasion, and a "send anonymously" option.
- **Recipient is not the buyer:** the checkout collects sender and recipient separately. The recipient's phone is required for delivery.
- **"I don't know the address" option:** the shop contacts the recipient to get the address. Can be switched on or off in admin.
- **Substitution policy:** a checkbox at checkout to accept substitution of equal or higher value if a stem is unavailable.
- **Pre-delivery photo:** staff upload a photo of the finished bouquet; the sender receives it by email and WhatsApp.
- **Occasion reminders:** customers save dates (birthday, anniversary) and receive a reminder before each one.
- **Seasonal mode:** admin can schedule a campaign (Valentine's Day, Mother's Day on 21 March, Eid, National Day, Ramadan) with its own banner, featured collection, delivery cutoffs and order capacity.
- **WhatsApp button** floating on every page, with the number set in admin.

- **Product badges** on cards and product pages: Same day, Express, Free delivery, New, Best seller, Limited.
- **Free-delivery progress** in the cart ("add AED 40 more for free delivery") and in the announcement bar.
- **Cakes:** each cake has a type (creamy, fondant, signature), flavour, weight, number of servings, a message to write on the cake, an optional photo upload for printed toppers, and its own preparation time.
- **Combos and trays:** a product can be a bundle of other products (for example bouquet plus cake) sold at one price, with stock taken from each part.
- **Partner collections:** a collection can carry a partner brand's name, logo and story.
- **Branches:** a store locator page listing each branch with map, hours and phone. Pickup orders choose a branch.
- **Installable web app:** a web app manifest and icons so customers can add the store to their phone's home screen.

### 4.4 Flower subscriptions

- Plans for weekly, every two weeks, or monthly delivery, each with a size and price, created in admin.
- The customer chooses the plan, delivery day, slot, address and start date, and pays by saved card through Stripe. Renewal is automatic.
- From their account the customer can skip a delivery, pause, change the address or day, and cancel. A skipped delivery is not charged.
- Each renewal creates a normal order in admin. Failed renewals are retried, the customer is told, and the subscription pauses after the final failed attempt.
- Delivery fee for subscriptions is set in admin (free by default).

### 4.5 Bespoke orders

- A "Design your own" form for custom cakes, bouquets and gifts: occasion, budget, date, colours, description and reference photos.
- The request appears in admin as a quote. Staff reply with a price and a payment link; once paid it becomes a normal order.
- The form also offers a button to continue the conversation on WhatsApp with the request details prefilled.

### 4.3 Languages and layout

- English and Arabic for every page, email, notification and error message.
- Arabic uses a right-to-left layout and an Arabic font. Choose a font pair that works for both scripts and load it with `next/font`.
- Products, categories, pages and banners have English and Arabic fields in the database. If the Arabic field is empty, fall back to English.
- The language switcher keeps the customer on the same page.
- Prices are shown in AED and include VAT. Store all money as whole fils (integers).

## 5. Checkout

A single page with clear steps, usable with one hand on a phone:

1. **Delivery or pickup.**
2. **Recipient:** name, phone, emirate and area (drives the delivery fee), address details, optional map pin, delivery notes.
3. **Date and time slot:** only dates and slots allowed by the admin rules in section 6 are selectable.
4. **Card message** and anonymous option.
5. **Sender details:** name, email, phone. Offer account creation after the order, never before.
6. **Discount code or gift voucher.**
7. **Payment method:** only the methods enabled in admin are shown.
8. **Order summary:** items, add-ons, delivery fee, discount, VAT amount shown as included, total.

Rules:

- Recalculate every price, fee, discount and total on the server from the database. Never trust amounts sent by the browser.
- Reserve stock and slot capacity when payment starts; release the reservation if payment fails or times out.
- Create the order as `pending_payment`, and mark it `paid` only from the provider's verified webhook, not from the browser redirect.
- Make order creation and webhook handling idempotent so retries never create duplicates.
- Save abandoned carts with contact details so the shop can follow up, where the customer has consented.

## 6. Delivery settings (all controlled in admin)

The owner decides coverage and rules in the admin panel. Nothing about delivery is fixed in code.

- **Zones:** a list of emirates and areas. Each area has an active switch, a delivery fee, an optional remote-area surcharge, an optional minimum order value, an optional free-delivery threshold, an optional small-order surcharge below a set value, and a lead time (same day, next day, or a number of days). An area can be marked as not served, with a message shown to the customer.
- **Branches:** each branch has an address, hours, the zones it serves, and whether it offers pickup.
- **Time slots:** named slots with start and end times, per zone, each with a maximum number of orders per day.
- **Same-day cutoff:** a cutoff time per zone and per weekday.
- **Express delivery:** optional surcharge with its own lead time.
- **Store pickup:** on or off, with pickup hours and preparation time.
- **Calendar:** closed dates, opening hours per weekday, and special days with their own cutoffs, fees and capacity.
- **Per-product rules:** minimum preparation time for a product (for example custom cakes need 24 hours) and zones where it cannot be delivered.

Seed the database with all seven emirates and common areas, all inactive, so the owner only has to switch on the ones they serve and set the fees.

## 7. Payments

Build one `PaymentProvider` interface with these operations: create a payment session, handle the return, verify and process a webhook, refund fully or partly, and fetch status. Implement one adapter per provider:

| Provider | Covers |
|---|---|
| Stripe | Cards, Apple Pay, Google Pay in AED |
| Tabby | Buy now, pay later |
| Tamara | Buy now, pay later |
| Ziina | Card and payment link |
| Telr | Card through the hosted payment page |

Requirements:

- Each provider has an on/off switch, a display order, a sandbox or live mode, and minimum and maximum order amounts in admin settings. Keys stay in environment variables, not in the database.
- Show Tabby and Tamara instalment messaging on the product page and in the cart when they are enabled and the amount qualifies.
- Verify the signature of every webhook. Log every payment event in a `payment_events` table.
- Refunds are issued from the admin order page and recorded against the order.
- Admin can generate a payment link for an order taken by phone or WhatsApp, using Ziina or Telr.
- Card details never touch our server; use each provider's hosted fields or hosted page.

## 8. Admin panel (`/admin`)

- **Dashboard:** today's orders by status, deliveries due today by slot, revenue for today, the week and the month, low stock alerts, best sellers.
- **Orders:** list with filters for status, delivery date, zone and payment method, plus search. Order detail with a timeline, status changes, internal notes, pre-delivery photo upload, refund, resend notifications, and a printable order ticket and card message. Staff can also create an order manually.
- **Order statuses:** `pending_payment`, `paid`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`, `refunded`. Each change is logged with who made it and when, and can trigger a customer notification.
- **Daily delivery sheet:** printable list for a date, grouped by slot and zone.
- **Products:** create, edit, duplicate and archive; variants; images with drag-and-drop ordering; English and Arabic fields; categories, occasions, colours, flower types and tags; add-on flag; stock per variant or "made to order"; a daily limit; scheduled visibility; SEO fields.
- **Categories and occasions:** with images and ordering.
- **Customers:** list, order history, notes.
- **Subscriptions:** plans, active subscribers, upcoming renewals, failed payments.
- **Quotes:** bespoke requests, reply with a price, send a payment link, convert to an order.
- **Branches:** addresses, hours, zones served, pickup.
- **Discounts:** percentage or fixed amount, free delivery, minimum spend, date range, usage limits, restricted to products or categories. Gift vouchers with a balance.
- **Content:** home page banners and sections, content pages, FAQ, announcement bar, seasonal campaigns.
- **Reviews:** approve, reply, hide.
- **Settings:** shop details, delivery (section 6), payments (section 7), notification templates, tax, staff accounts and roles, social links, analytics IDs.
- **Reports:** sales by day, product, category, zone and payment method, with CSV export.
- **Audit log** of admin actions.

The admin panel is in English, works well on a tablet, and is protected by login with a required second factor for the owner role.

## 9. Notifications

- **Customer email:** order received, payment confirmed, being prepared (with photo), out for delivery, delivered, cancelled, refunded, occasion reminder, abandoned cart.
- **Customer WhatsApp:** the same key events through the WhatsApp Business Cloud API using approved templates. Put this behind a provider interface so SMS can be added later. If no WhatsApp credentials are set, skip silently and rely on email.
- **Shop alerts:** new paid order by email and WhatsApp to the shop number, plus a sound and badge in the admin panel.
- Templates are editable in admin, in both languages, with variables such as order number and delivery slot.

## 10. Integration API for Bind Manager (prepare only)

Do not connect to Bind Manager now. Prepare a clean interface so it can be connected later:

- A versioned REST API under `/api/v1` secured with API keys created in admin: list and read orders, update order status, list products, update stock and price.
- Outgoing webhooks, signed with a secret, for `order.paid`, `order.status_changed`, `order.cancelled` and `stock.low`, with retries and a delivery log in admin.
- An `external_ref` field on products, variants, customers and orders to hold Bind Manager IDs.
- Document the API in `docs/API.md`.

## 11. Quality requirements

- **Data model:** tables for products, variants, images, categories, occasions, add-on links, customers, addresses, carts, orders, order items, order status history, payments, payment events, refunds, discounts, vouchers, delivery zones, time slots, calendar rules, reviews, content, settings, staff profiles, API keys, webhook deliveries and the audit log. Write the schema in `docs/SCHEMA.md` before migrating.
- **Security:** row level security on every table; the service role key is used only on the server; rate limiting on login, checkout, tracking and forms; bot protection on public forms; security headers and a content security policy; uploads checked for type and size; no personal data in logs.
- **Performance:** Lighthouse mobile scores of 90 or more for performance, accessibility, best practices and SEO on the home, listing and product pages. Use `next/image`, cached listing pages, and revalidation when admin changes content.
- **SEO:** localised metadata, `hreflang` between English and Arabic, sitemap, robots file, Product and LocalBusiness structured data, Open Graph images, clean URLs with slugs in both languages.
- **Accessibility:** WCAG 2.1 AA, full keyboard use, visible focus states, correct labels, and correct behaviour in right-to-left.
- **Legal:** cookie consent, privacy policy, terms, refund and substitution policy, VAT-inclusive pricing, and a tax invoice (PDF) per order showing the shop's tax registration number.
- **Testing:** unit tests for pricing, discounts, delivery fees, slot availability and cutoffs; integration tests for each payment adapter with mocked webhooks; Playwright tests for browsing, the full checkout in both languages, order tracking, and the main admin flows.
- **Operations:** a seed script with realistic demo products in both languages; `README.md` with setup, environment variables and deployment steps; `docs/ADMIN_GUIDE.md` written for shop staff.

## 12. Phases

### Phase 0: Discovery and setup
Ask the questions in section 13. Scaffold the project, lint and format rules, CI (lint, type check, tests, build), Supabase project and migrations, environment files. Write `docs/SCHEMA.md` and the sitemap.
**Done when:** the empty app deploys to a Vercel preview and CI is green.

### Phase 1: Design system and layout
Brand colours and fonts as design tokens, components, header, footer, mobile navigation, language switcher, right-to-left layout.
**Done when:** a sample page looks correct in English and Arabic on phone and desktop.

### Phase 2: Catalogue
Schema and seed data, home, listings, filters (including flower format), search, product page with variants and add-ons, cake options, combos, badges, partner collections, branch locator, content pages.
**Done when:** a visitor can browse the seeded catalogue in both languages and Lighthouse targets are met.

### Phase 3: Admin core
Admin login and roles, products, categories, occasions, images, stock, content, settings shell.
**Done when:** a product created in admin appears on the storefront in both languages, and role permissions are covered by tests.

### Phase 4: Cart, delivery and checkout
Cart, delivery settings in admin, date and slot picker, recipient and sender forms, card message, discounts, server-side totals, order creation.
**Done when:** an order can be placed with a test payment stub, and delivery rules set in admin correctly change the available dates, slots and fees.

### Phase 5: Payments
The provider interface, then Stripe, Tabby, Tamara, Ziina and Telr in that order, webhooks, refunds, payment links, admin switches.
**Done when:** each provider completes a sandbox payment and refund from start to finish, and webhook tests pass.

### Phase 6: Orders and notifications
Order management, status flow, tickets and delivery sheet, pre-delivery photo, order tracking, email and WhatsApp notifications, tax invoice PDF.
**Done when:** an order can be taken from paid to delivered in admin, with the customer notified at each step.

### Phase 7: Accounts and retention
Customer accounts, addresses, wishlist, occasion reminders, reviews, vouchers, abandoned cart emails, seasonal campaigns, flower subscriptions (section 4.4), bespoke orders and quotes (section 4.5), installable web app.
**Done when:** each feature has a passing end-to-end test.

### Phase 8: Integration API, reports and analytics
The API and webhooks from section 10, reports and CSV export, GA4 and Meta Pixel e-commerce events behind consent, audit log.
**Done when:** `docs/API.md` is complete and the API has integration tests.

### Phase 9: Hardening and launch
Security review, accessibility pass, performance pass, full end-to-end run, error monitoring, backups, staff guide, production deployment checklist (domain, live keys, webhook URLs, email domain records).
**Done when:** the launch checklist in `docs/LAUNCH.md` is fully ticked and I approve go-live.

## 13. What I need from the owner

Ask me these before Phase 1 and record the answers in `docs/BRAND_AND_CONTENT.md`:

1. Logo files, brand colours, fonts, and two or three websites whose look I like.
2. The domain name and whether it is already registered.
3. Shop details: legal name, address, map location, phone, WhatsApp number, email, opening hours, tax registration number, trade licence number.
4. The product list: names, prices, sizes, photos, descriptions (a spreadsheet is fine), and whether I want Arabic text written for me.
5. Categories and occasions to launch with, and the add-ons I sell (cakes, chocolates, balloons, vases).
6. Which payment accounts already exist (Stripe, Tabby, Tamara, Ziina, Telr) and which still need to be opened.
7. Whether a WhatsApp Business API account exists for notifications.
8. My refund, cancellation and substitution policy.
9. Who needs admin access and in which role.
10. Social media links and any existing customer reviews to show.

## 14. Definition of done for the whole project

- A customer can order a bouquet with add-ons, for a chosen date and slot, in English or Arabic, on a phone, and pay with any enabled method.
- The shop is alerted, can process the order to delivery, and the customer is kept informed and can track it.
- The owner can change products, prices, delivery areas, fees, slots, cutoffs, payment methods and content without a developer.
- All tests pass, Lighthouse targets are met, and the launch checklist is complete.
