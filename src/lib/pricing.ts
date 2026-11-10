import { getProductById, getVariant } from "./catalog";
import { discountCodes, zones } from "./data/delivery";
import type { CartLine, Totals } from "./types";

export const VAT_RATE = 0.05;
export const MAX_QUANTITY = 20;

export type PricedLine = CartLine & { unitPrice: number; lineTotal: number };

/** Prices each line from the catalogue; unknown products or variants are dropped. */
export function priceLines(lines: CartLine[]): PricedLine[] {
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = getProductById(line.productId);
    const variant = product && getVariant(product, line.variantId);
    if (!variant) continue;
    const quantity = Math.min(Math.max(Math.floor(line.quantity), 1), MAX_QUANTITY);
    priced.push({ ...line, quantity, unitPrice: variant.price, lineTotal: variant.price * quantity });
  }
  return priced;
}

export function deliveryFeeFor(zoneId: string | null, subtotal: number): number {
  if (!zoneId) return 0; // pickup
  const zone = zones.find((z) => z.id === zoneId && z.active);
  if (!zone) return 0;
  if (zone.freeOver !== null && subtotal >= zone.freeOver) return 0;
  return zone.fee;
}

export function discountFor(code: string | undefined, subtotal: number): number {
  if (!code) return 0;
  const rule = discountCodes[code.trim().toUpperCase()];
  return rule ? Math.round((subtotal * rule.percent) / 100) : 0;
}

/**
 * The single source of truth for order totals. Always called on the server
 * at checkout; amounts sent by the browser are never trusted.
 */
export function computeTotals(
  lines: CartLine[],
  zoneId: string | null,
  discountCode?: string,
): Totals {
  const subtotal = priceLines(lines).reduce((sum, l) => sum + l.lineTotal, 0);
  const discount = discountFor(discountCode, subtotal);
  const deliveryFee = deliveryFeeFor(zoneId, subtotal - discount);
  const total = subtotal - discount + deliveryFee;
  const vatIncluded = Math.round((total * VAT_RATE) / (1 + VAT_RATE));
  return { subtotal, deliveryFee, discount, total, vatIncluded };
}
