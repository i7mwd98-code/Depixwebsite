"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatMoney } from "@/lib/money";
import { MAX_QUANTITY } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export function ProductPurchase({ product, addons }: { product: Product; addons: Product[] }) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const { add } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [inscription, setInscription] = useState("");
  const [chosenAddons, setChosenAddons] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const addonTotal = addons
    .filter((a) => chosenAddons.includes(a.id))
    .reduce((sum, a) => sum + a.variants[0].price, 0);
  const total = variant.price * quantity + addonTotal;
  const isCake = product.format === "cake";

  const toggleAddon = (id: string) =>
    setChosenAddons((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const submit = () => {
    add({
      productId: product.id,
      variantId: variant.id,
      quantity,
      ...(isCake && inscription.trim() ? { inscription: inscription.trim() } : {}),
    });
    for (const addon of addons.filter((a) => chosenAddons.includes(a.id))) {
      add({ productId: addon.id, variantId: addon.variants[0].id, quantity: 1 });
    }
    setChosenAddons([]);
    setAdded(true);
  };

  return (
    <div className="space-y-6">
      {product.variants.length > 1 && (
        <fieldset>
          <legend className="label">{t("size")}</legend>
          <div className="grid grid-cols-3 gap-2">
            {product.variants.map((v) => (
              <label
                key={v.id}
                className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-forest ${
                  v.id === variant.id ? "border-forest bg-forest text-white" : "border-line bg-white hover:border-forest"
                }`}
              >
                <input type="radio" name="variant" className="sr-only" checked={v.id === variant.id} onChange={() => { setVariantId(v.id); setAdded(false); }} />
                <span className="block font-semibold">{v.name[locale]}</span>
                <span className="block text-xs opacity-80">{formatMoney(v.price, locale)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {isCake && (
        <label className="block">
          <span className="label">{t("inscription")}</span>
          <input className="field" maxLength={40} value={inscription} onChange={(e) => setInscription(e.target.value)} />
          <span className="mt-1 block text-xs text-muted">{t("inscriptionHint")}</span>
        </label>
      )}

      {addons.length > 0 && (
        <fieldset>
          <legend className="label">{t("addons")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {addons.map((a) => {
              const on = chosenAddons.includes(a.id);
              return (
                <label key={a.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm ${on ? "border-forest bg-blush-soft" : "border-line bg-white hover:border-forest"}`}>
                  <input type="checkbox" className="h-4 w-4 accent-[var(--color-forest)]" checked={on} onChange={() => toggleAddon(a.id)} />
                  <span className="flex-1">{a.name[locale]}</span>
                  <span className="text-muted">+{formatMoney(a.variants[0].price, locale)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-line bg-white" role="group" aria-label={t("quantity")}>
          <button type="button" className="h-11 w-11 text-lg" aria-label="-" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)}>−</button>
          <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{quantity}</span>
          <button type="button" className="h-11 w-11 text-lg" aria-label="+" disabled={quantity >= MAX_QUANTITY} onClick={() => setQuantity((q) => q + 1)}>+</button>
        </div>
        <button type="button" className="btn btn-primary flex-1" onClick={submit}>
          {t("add")} · {formatMoney(total, locale)}
        </button>
      </div>

      {added && (
        <p className="flex items-center justify-between gap-3 rounded-xl bg-blush-soft px-4 py-3 text-sm" role="status">
          <span>{t("added")}</span>
          <Link href="/cart" className="font-semibold text-forest underline underline-offset-4">{t("viewCart")}</Link>
        </p>
      )}
    </div>
  );
}
