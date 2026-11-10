import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { slots, zones } from "@/lib/data/delivery";
import { formatMoney } from "@/lib/money";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "deliveryPage" });
  return { title: t("title") };
}

export default async function DeliveryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("deliveryPage");
  const active = zones.filter((z) => z.active);

  return (
    <div className="container-page max-w-3xl py-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">{t("title")}</h1>
      <p className="mt-3 text-muted">{t("intro")}</p>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="bg-sand text-start">
            <tr>
              {[t("area"), t("fee"), t("freeOver"), t("sameDay")].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-start font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {active.map((z) => (
              <tr key={z.id}>
                <th scope="row" className="px-4 py-3 text-start font-medium">{z.name[locale]}</th>
                <td className="px-4 py-3">{formatMoney(z.fee, locale)}</td>
                <td className="px-4 py-3">{z.freeOver === null ? t("never") : formatMoney(z.freeOver, locale)}</td>
                <td className="px-4 py-3">{z.sameDay ? <span dir="ltr">{z.cutoff}</span> : t("nextDay")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">{t("sample")}</p>

      <h2 className="mt-10 text-2xl font-semibold">{t("slots")}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {slots.map((s) => (
          <li key={s.id} className="card p-4">
            <p className="font-semibold">{s.label[locale]}</p>
            <p className="text-sm text-muted" dir="ltr">{s.start} – {s.end}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-muted">{t("pickup")}</p>
    </div>
  );
}
