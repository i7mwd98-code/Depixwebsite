import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <Link href="/" className="btn btn-primary mt-6">{t("back")}</Link>
    </div>
  );
}
