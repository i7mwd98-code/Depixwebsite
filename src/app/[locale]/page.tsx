import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listFeatured } from "@/lib/catalog";
import { products } from "@/lib/data/products";
import { whatsappLink } from "@/lib/site";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import type { Occasion } from "@/lib/types";

const OCCASIONS: Occasion[] = ["birthday", "love", "anniversary", "newBaby", "congratulations", "thankYou", "getWell"];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const hero = products[0];
  const featured = listFeatured().slice(0, 8);

  return (
    <>
      <section className="bg-blush-soft">
        <div className="container-page grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{t("home.eyebrow")}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-forest sm:text-5xl">{t("home.heroTitle")}</h1>
            <p className="mt-4 max-w-md text-lg text-muted">{t("home.heroText")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop?category=flowers" className="btn btn-primary">{t("home.shopFlowers")}</Link>
              <Link href="/shop?category=cakes" className="btn btn-outline">{t("home.shopCakes")}</Link>
            </div>
          </div>
          <ProductArt id="hero" palette={hero.palette} format="bouquet" className="mx-auto aspect-square w-full max-w-md rounded-[2rem]" />
        </div>
      </section>

      <section className="container-page grid gap-4 py-10 sm:grid-cols-3">
        {([1, 2, 3] as const).map((n) => (
          <div key={n} className="card p-5">
            <h2 className="text-lg font-semibold text-forest">{t(`home.promise${n}Title`)}</h2>
            <p className="mt-1 text-sm text-muted">{t(`home.promise${n}Text`)}</p>
          </div>
        ))}
      </section>

      <section className="container-page py-6">
        <h2 className="text-2xl font-semibold sm:text-3xl">{t("home.occasionsTitle")}</h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {OCCASIONS.map((o) => (
            <Link key={o} href={`/shop?occasion=${o}`} className="chip">{t(`occasions.${o}`)}</Link>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">{t("home.featuredTitle")}</h2>
          <Link href="/shop" className="text-sm font-semibold text-forest underline underline-offset-4">{t("home.viewAll")}</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="container-page py-6">
        <div className="rounded-3xl bg-forest px-6 py-10 text-center text-white sm:px-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">{t("home.bespokeTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">{t("home.bespokeText")}</p>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn mt-6 bg-white text-forest hover:bg-blush-soft">
            {t("home.bespokeCta")}
          </a>
        </div>
      </section>
    </>
  );
}
