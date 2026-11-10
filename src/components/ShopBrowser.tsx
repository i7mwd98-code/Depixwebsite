"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { fromPrice } from "@/lib/catalog";
import type { Category, Colour, Occasion, Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

const CATEGORIES: Category[] = ["flowers", "cakes", "gifts"];
const OCCASIONS: Occasion[] = ["birthday", "love", "anniversary", "newBaby", "congratulations", "thankYou", "getWell"];
const COLOURS: Colour[] = ["pink", "red", "white", "yellow", "purple", "mixed"];
const SORTS = ["featured", "low", "high"] as const;

export function ShopBrowser({ products }: { products: Product[] }) {
  const t = useTranslations();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const pick = <T extends string>(key: string, allowed: readonly T[]): T | null => {
    const value = params.get(key);
    return allowed.includes(value as T) ? (value as T) : null;
  };
  const category = pick("category", CATEGORIES);
  const occasion = pick("occasion", OCCASIONS);
  const colour = pick("colour", COLOURS);
  const sort = pick("sort", SORTS) ?? "featured";

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const visible = products
    .filter((p) => !category || p.category === category)
    .filter((p) => !occasion || p.occasions.includes(occasion))
    .filter((p) => !colour || p.colour === colour)
    .sort((a, b) => {
      if (sort === "low") return fromPrice(a) - fromPrice(b);
      if (sort === "high") return fromPrice(b) - fromPrice(a);
      return Number(b.featured) - Number(a.featured);
    });

  const filtered = Boolean(category || occasion || colour);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("shop.category")}>
        <button type="button" className={`chip ${!category ? "chip-on" : ""}`} aria-pressed={!category} onClick={() => set("category", null)}>
          {t("categories.all")}
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className={`chip ${category === c ? "chip-on" : ""}`} aria-pressed={category === c} onClick={() => set("category", c)}>
            {t(`categories.${c}`)}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:max-w-2xl">
        <label>
          <span className="label">{t("shop.occasion")}</span>
          <select className="field" value={occasion ?? ""} onChange={(e) => set("occasion", e.target.value || null)}>
            <option value="">{t("shop.any")}</option>
            {OCCASIONS.map((o) => <option key={o} value={o}>{t(`occasions.${o}`)}</option>)}
          </select>
        </label>
        <label>
          <span className="label">{t("shop.colour")}</span>
          <select className="field" value={colour ?? ""} onChange={(e) => set("colour", e.target.value || null)}>
            <option value="">{t("shop.any")}</option>
            {COLOURS.map((c) => <option key={c} value={c}>{t(`colours.${c}`)}</option>)}
          </select>
        </label>
        <label className="col-span-2 sm:col-span-1">
          <span className="label">{t("shop.sort")}</span>
          <select className="field" value={sort} onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}>
            <option value="featured">{t("shop.sortFeatured")}</option>
            <option value="low">{t("shop.sortLow")}</option>
            <option value="high">{t("shop.sortHigh")}</option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted">
        <p aria-live="polite">{t("shop.count", { count: visible.length })}</p>
        {filtered && (
          <button type="button" className="font-semibold text-forest underline underline-offset-4" onClick={() => router.replace(pathname, { scroll: false })}>
            {t("shop.clear")}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="card mt-6 p-10 text-center text-muted">{t("shop.empty")}</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
