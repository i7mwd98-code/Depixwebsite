# Decisions

Choices made where the spec left room, newest last.

1. **Version 1 scope.** Storefront, cart and checkout on sample data, without a database or payments. This gives something to review and click through before accounts (Supabase, Stripe, Tabby, Tamara, Ziina, Telr) are opened.
2. **Sample data behind an access layer.** Pages read the catalogue through `src/lib/catalog.ts` and delivery settings through `src/lib/data/delivery.ts`, so both can be swapped for database queries without changing pages.
3. **Fonts are self-hosted** (Fontsource packages: Playfair Display, Inter, Tajawal) so the build does not depend on a font service.
4. **Placeholder artwork.** Product pictures are drawn from each product's colour palette (`ProductArt`) until real photos are supplied.
5. **Brand look is provisional.** Colours (ivory, forest green, blush) and the wordmark are placeholders pending the real logo and brand colours.
6. **Next.js cache components are off.** The scaffold enabled them; they are disabled for now to keep the translated static pages simple. Revisit when the database arrives.
7. **Phone numbers.** Checkout accepts UAE mobile numbers only (05X XXX XXXX, with or without +971). Revisit if recipients with landlines or foreign senders must be supported.
8. **Slot rule.** A slot is offered if the order can be ready at least one hour before the slot ends, and same-day closes at the area's cutoff. To be replaced by admin-set rules and per-slot capacity.
