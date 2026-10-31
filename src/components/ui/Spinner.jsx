import { useTranslation } from "react-i18next";

export default function Spinner() {
  const { t } = useTranslation();
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">{t("common.loading")}</span>
    </div>
  );
}
