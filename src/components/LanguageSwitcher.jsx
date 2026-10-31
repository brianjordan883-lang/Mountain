import { useTranslation } from "react-i18next";

const langs = [
  { code: "kg", label: "KG" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <div className="lang" role="group" aria-label={t("nav.language")}>
      {langs.map((language) => (
        <button
          key={language.code}
          type="button"
          className={`lang__btn ${current === language.code ? "is-active" : ""}`}
          aria-pressed={current === language.code}
          onClick={() => i18n.changeLanguage(language.code)}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}
