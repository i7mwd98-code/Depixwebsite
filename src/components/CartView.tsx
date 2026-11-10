"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProductById, getVariant } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { MAX_QUANTITY } from "@/lib/pricing";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";

export function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { lines, ready, subtotal, setQuantity, remove } = useCart();

  if (!ready) return <div className="h-40" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-muted">{t("empty")}</p>
        <Link href="/shop" className="btn btn-primary mt-5">{t("continue")}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-line">
        {lines.map((line, index) => {
          const product = getProductById(line.productId);
          const variant = product && getVariant(product, line.variantId);
          if (!product || !variant) return null;
          return (
            <li key={`${line.productId}-${line.variantId}-${line.inscription ?? ""}`} className="flex gap-4 py-4">
              <Link href={`/product/${product.slug}`} className="shrink-0">
                <ProductArt id={product.id} palette={product.palette} format={product.format} className="h-24 w-24 rounded-xl" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{product.name[locale]}</p>
                    {product.variants.length > 1 && <p className="text-sm text-muted">{variant.name[locale]}</p>}
                    {line.inscription && <p className="text-sm text-muted">{t("inscription", { text: line.inscription })}</p>}
                  </div>
                  <p className="shrink-0 font-semibold">{formatMoney(variant.price * line.quantity, locale)}</p>
                </div>
                <div className="mt-2 flex items-center gap-4">
                  <div className="inline-flex items-center rounded-full border border-line bg-white">
                    <button type="button" className="h-10 w-10" aria-label="-" onClick={() => setQuantity(index, line.quantity - 1)}>−</button>
                    <span className="w-7 text-center text-sm font-semibold">{line.quantity}</span>
                    <button type="button" className="h-10 w-10" aria-label="+" disabled={line.quantity >= MAX_QUANTITY} onClick={() => setQuantity(index, line.quantity + 1)}>+</button>
                  </div>
                  <button type="button" className="text-sm text-muted underline underline-offset-4 hover:text-danger" onClick={() => remove(index)}>
                    {t("remove")}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="card h-fit p-5">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>{t("subtotal")}</span>
          <span>{formatMoney(subtotal, locale)}</span>
        </div>
        <p className="mt-1 text-sm text-muted">{t("deliveryNote")}</p>
        <Link href="/checkout" className="btn btn-primary mt-5 w-full">{t("checkout")}</Link>
        <Link href="/shop" className="btn mt-2 w-full text-forest hover:bg-sand">{t("continue")}</Link>
      </aside>
    </div>
  );
}
