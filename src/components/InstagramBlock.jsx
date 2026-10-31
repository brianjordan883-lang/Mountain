import { useTranslation } from "react-i18next";
import { useSettings } from "../hooks/useSettings";
import InstagramIcon from "./InstagramIcon";

export default function InstagramBlock() {
  const { t } = useTranslation();
  const { contacts } = useSettings();
  return (
    <section className="section about" id="instagram">
      <div className="bubble bubble--a" />
      <div className="container narrow center">
        <h2>{t("instagram.title")}</h2>
        <p>{t("instagram.text")}</p>
        <a className="btn btn--primary btn--icon" href={contacts.instagram} target="_blank" rel="noreferrer">
          <InstagramIcon /> @calma.mountain
        </a>
      </div>
    </section>
  );
}
