import { useTranslation } from "react-i18next";

export default function Pagination({ page, totalPages, onChange }) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="pagination">
      <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        {t("pagination.prev")}
      </button>
      <span className="muted">{t("pagination.page", { page, total: totalPages })}</span>
      <button type="button" className="btn btn--ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        {t("pagination.next")}
      </button>
    </nav>
  );
}
