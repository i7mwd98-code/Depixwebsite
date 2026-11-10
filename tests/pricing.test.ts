import { describe, expect, it } from "vitest";
import { computeTotals, priceLines } from "../src/lib/pricing";
import { aed } from "../src/lib/money";

const bouquet = { productId: "p-blush-garden", variantId: "standard", quantity: 1 }; // AED 220

describe("pricing", () => {
  it("prices lines from the catalogue and ignores unknown items", () => {
    const lines = priceLines([bouquet, { productId: "nope", variantId: "x", quantity: 1 }]);
    expect(lines).toHaveLength(1);
    expect(lines[0].lineTotal).toBe(aed(220));
  });

  it("clamps quantity", () => {
    expect(priceLines([{ ...bouquet, quantity: 999 }])[0].quantity).toBe(20);
    expect(priceLines([{ ...bouquet, quantity: -3 }])[0].quantity).toBe(1);
  });

  it("charges the zone fee below the free-delivery threshold", () => {
    const t = computeTotals([bouquet], "dubai-central");
    expect(t.deliveryFee).toBe(aed(25));
    expect(t.total).toBe(aed(245));
  });

  it("gives free delivery at the threshold", () => {
    const t = computeTotals([{ ...bouquet, quantity: 2 }], "dubai-central");
    expect(t.deliveryFee).toBe(0);
    expect(t.total).toBe(aed(440));
  });

  it("charges nothing for pickup", () => {
    expect(computeTotals([bouquet], null).deliveryFee).toBe(0);
  });

  it("applies a discount code before the delivery threshold", () => {
    const t = computeTotals([{ ...bouquet, variantId: "deluxe" }], "dubai-central", "welcome10");
    expect(t.discount).toBe(aed(32));
    expect(t.deliveryFee).toBe(aed(25)); // 288 after discount is below 300
    expect(t.total).toBe(aed(313));
  });

  it("reports the VAT included in the total", () => {
    const t = computeTotals([{ ...bouquet, quantity: 1 }], null);
    expect(t.vatIncluded).toBe(Math.round((aed(220) * 5) / 105));
  });
});
