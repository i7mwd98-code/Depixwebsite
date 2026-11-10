import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "@/components/CheckoutForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("title"), robots: { index: false } };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-3xl font-semibold sm:text-4xl">{t("title")}</h1>
      <CheckoutForm />
    </div>
  );
}
