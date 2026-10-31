import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Forbidden() {
  const { t } = useTranslation();

  return (
    <section className="section page">
      <div className="container narrow center">
        <h1>{t("auth.forbidden")}</h1>
        <p>{t("auth.forbiddenText")}</p>
        <Link to="/" className="btn btn--primary">{t("notFound.home")}</Link>
      </div>
    </section>
  );
}
