import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { getProductBySlug, listAddons, listProducts } from "@/lib/catalog";
import { products } from "@/lib/data/products";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { ProductPurchase } from "@/components/ProductPurchase";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name[locale as Locale], description: product.description[locale as Locale] };
}

export default async function ProductPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const t = await getTranslations();

  const related = listProducts()
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative">
          <ProductArt id={product.id} palette={product.palette} format={product.format} className="aspect-square w-full rounded-3xl md:sticky md:top-32" />
        </div>
        <div>
          {product.badges.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {product.badges.map((b) => (
                <span key={b} className="rounded-full bg-blush-soft px-2.5 py-1 text-xs font-semibold text-forest">{t(`badges.${b}`)}</span>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-semibold text-forest sm:text-4xl">{product.name[locale]}</h1>
          <p className="mt-3 text-muted">{product.description[locale]}</p>

          <div className="mt-6">
            <ProductPurchase product={product} addons={product.isAddon ? [] : listAddons()} />
          </div>

          <dl className="mt-8 space-y-4 border-t border-line pt-6 text-sm">
            <div>
              <dt className="font-semibold">{t("product.includes")}</dt>
              <dd className="mt-1 text-muted">{product.includes[locale]}</dd>
            </div>
            {product.servings && (
              <div>
                <dt className="font-semibold">{t("product.servings")}</dt>
                <dd className="mt-1 text-muted">{product.servings[locale]}</dd>
              </div>
            )}
          </dl>
          <ul className="mt-5 space-y-1.5 text-sm text-muted">
            {product.prepHours > 0 && <li>{t("product.prep", { hours: product.prepHours })}</li>}
            {product.category === "flowers" && <li>{t("product.substitution")}</li>}
            <li>{t("product.vat")}</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">{t("product.related")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
