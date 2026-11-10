import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site, whatsappLink } from "@/lib/site";

export async function Footer() {
  const t = await getTranslations();
  return (
    <footer className="mt-20 border-t border-line bg-sand">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-semibold text-forest">{t("brand.name")}</p>
          <p className="mt-2 max-w-sm text-sm text-muted">{t("footer.about")}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">{t("footer.shop")}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-forest" href="/shop?category=flowers">{t("nav.flowers")}</Link></li>
            <li><Link className="hover:text-forest" href="/shop?category=cakes">{t("nav.cakes")}</Link></li>
            <li><Link className="hover:text-forest" href="/shop?category=gifts">{t("nav.gifts")}</Link></li>
            <li><Link className="hover:text-forest" href="/delivery">{t("nav.delivery")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{t("footer.contact")}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><a className="hover:text-forest" href={whatsappLink()} target="_blank" rel="noopener noreferrer">{t("footer.whatsapp")}</a></li>
            <li><a className="hover:text-forest" href={`tel:${site.phone.replace(/\s/g, "")}`} dir="ltr">{site.phone}</a></li>
            <li><a className="hover:text-forest" href={`mailto:${site.email}`}>{site.email}</a></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {t("brand.name")} {t("brand.tagline")}. {t("footer.rights")}
      </p>
    </footer>
  );
}
