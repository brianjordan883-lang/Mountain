import { useTranslation } from "react-i18next";

export default function SearchBar({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <input
      type="search"
      className="input"
      value={value}
      placeholder={t("cottagesPage.searchPlaceholder")}
      aria-label={t("common.search")}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
