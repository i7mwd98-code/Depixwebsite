"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "./CartProvider";

export function HeaderActions() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { count, ready } = useCart();
  const other = locale === "ar" ? "en" : "ar";

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        href={pathname}
        locale={other}
        className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium hover:bg-sand"
        lang={other}
      >
        {t("language")}
      </Link>
      <Link
        href="/cart"
        className="relative inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium hover:bg-sand"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
        </svg>
        <span>{t("cart")}</span>
        {ready && count > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1.5 text-xs font-semibold text-white">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}
