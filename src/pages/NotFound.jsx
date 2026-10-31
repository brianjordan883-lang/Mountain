import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound({ forbidden = false }) {
  const { t } = useTranslation();

  return (
    <section className="section">
      <div className="container text-center">
        <h1>{forbidden ? t("auth.forbidden") : t("common.notFound")}</h1>
        <p>{forbidden ? t("auth.forbiddenText") : t("common.notFoundText")}</p>
        <Link className="btn btn--primary" to="/">{t("nav.home")}</Link>
      </div>
    </section>
  );
}
