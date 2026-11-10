import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fromPrice } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { ProductArt } from "./ProductArt";

export function ProductCard({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const price = formatMoney(fromPrice(product), locale);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-sand">
        <ProductArt
          id={product.id}
          palette={product.palette}
          format={product.format}
          className="aspect-square w-full transition-transform duration-500 group-hover:scale-105"
        />
        {product.badges.length > 0 && (
          <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
            {product.badges.map((b) => (
              <span key={b} className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-forest shadow-sm">
                {t(`badges.${b}`)}
              </span>
            ))}
          </div>
        )}
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug group-hover:text-forest-soft">{product.name[locale]}</h3>
      <p className="mt-0.5 text-sm text-muted">
        {product.variants.length > 1 ? t("shop.from", { price }) : price}
      </p>
    </Link>
  );
}
