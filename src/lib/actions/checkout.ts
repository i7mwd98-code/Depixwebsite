"use server";

import { randomInt } from "node:crypto";
import { z } from "zod";
import { getProductById } from "../catalog";
import { availableSlots } from "../delivery";
import { computeTotals, priceLines } from "../pricing";
import type { Totals } from "../types";

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => text(max).min(1);
const phone = z
  .string()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^(?:\+971|00971|971|0)?5\d{8}$/));

const schema = z
  .object({
    lines: z
      .array(
        z.object({
          productId: z.string().max(64),
          variantId: z.string().max(64),
          quantity: z.number().int().min(1).max(20),
          inscription: text(40).optional(),
        }),
      )
      .min(1)
      .max(50),
    method: z.enum(["delivery", "pickup"]),
    zoneId: z.string().max(64).nullable(),
    recipientName: required(80),
    recipientPhone: phone,
    address: text(300),
    notes: text(300),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slotId: z.string().max(32),
    cardMessage: text(300),
    anonymous: z.boolean(),
    senderName: required(80),
    senderEmail: z.string().trim().email().max(120),
    senderPhone: phone,
    acceptSubstitution: z.boolean(),
    discountCode: text(32),
  })
  .superRefine((v, ctx) => {
    if (v.method === "delivery") {
      if (!v.zoneId) ctx.addIssue({ code: "custom", path: ["zoneId"], message: "required" });
      if (!v.address) ctx.addIssue({ code: "custom", path: ["address"], message: "required" });
    }
  });

export type CheckoutInput = z.input<typeof schema>;

export type CheckoutResult =
  | { ok: true; order: { number: string; date: string; slotId: string; totals: Totals } }
  | { ok: false; error: "empty" | "slot" | "invalid"; fields?: string[] };

function orderNumber(now: Date): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += alphabet[randomInt(alphabet.length)];
  return `BND-${now.toISOString().slice(2, 10).replace(/-/g, "")}-${suffix}`;
}

/**
 * Validates the order and recomputes every amount on the server.
 *
 * First version: the order is confirmed to the customer but NOT yet saved
 * or paid for. Persistence and payment arrive with the database and the
 * payment providers (spec phases 4 to 6).
 */
export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    return { ok: false, error: fields.includes("lines") ? "empty" : "invalid", fields };
  }
  const data = parsed.data;

  const lines = priceLines(data.lines);
  if (lines.length === 0) return { ok: false, error: "empty" };

  const zoneId = data.method === "delivery" ? data.zoneId : null;
  const prepHours = Math.max(0, ...lines.map((l) => getProductById(l.productId)?.prepHours ?? 0));
  const now = new Date();
  const slot = availableSlots(data.date, zoneId, prepHours, now).find((s) => s.id === data.slotId);
  if (!slot) return { ok: false, error: "slot" };

  const totals = computeTotals(lines, zoneId, data.discountCode || undefined);

  return {
    ok: true,
    order: { number: orderNumber(now), date: data.date, slotId: slot.id, totals },
  };
}
