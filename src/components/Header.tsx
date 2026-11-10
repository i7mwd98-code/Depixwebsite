import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeaderActions } from "./HeaderActions";

export async function Header() {
  const t = await getTranslations();
  const links = [
    { href: "/shop", label: t("nav.shop") },
    { href: "/shop?category=flowers", label: t("nav.flowers") },
    { href: "/shop?category=cakes", label: t("nav.cakes") },
    { href: "/shop?category=gifts", label: t("nav.gifts") },
    { href: "/delivery", label: t("nav.delivery") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur">
      <p className="bg-forest px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        {t("announcement")}
      </p>
      <div className="container-page flex items-center justify-between gap-4 py-2">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-forest">{t("brand.name")}</span>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted sm:inline">{t("brand.tagline")}</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label={t("nav.menu")}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3 py-2 text-sm font-medium hover:bg-sand">
              {l.label}
            </Link>
          ))}
        </nav>
        <HeaderActions />
      </div>
      <nav className="border-t border-line md:hidden" aria-label={t("nav.menu")}>
        <div className="flex gap-1 overflow-x-auto px-3 py-1.5">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="inline-flex min-h-10 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-sand">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
