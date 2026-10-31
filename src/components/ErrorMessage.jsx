import { useTranslation } from "react-i18next";

export default function ErrorMessage({ message, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="state state--error" role="alert">
      <p>{message ?? t("common.loadError")}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}
