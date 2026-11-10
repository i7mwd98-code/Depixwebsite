import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listProducts } from "@/lib/catalog";
import { ShopBrowser } from "@/components/ShopBrowser";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return { title: t("title") };
}

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">{t("title")}</h1>
      <div className="mt-6">
        <Suspense>
          <ShopBrowser products={listProducts()} />
        </Suspense>
      </div>
    </div>
  );
}
