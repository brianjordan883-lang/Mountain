import { useTranslation } from "react-i18next";

export default function Concept() {
  const { t } = useTranslation();

  return (
    <section className="section dark">
      <div className="container">
        <p className="quote">{t("concept.p1")}</p>
        <hr className="rule" />
        <p className="quote quote--sm">{t("concept.p2")}</p>
        <hr className="rule" />
        <p className="quote quote--sm">{t("concept.p3")}</p>
      </div>
    </section>
  );
}
