import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Modal({ title, onClose, children }) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="modal__head">
          <h3>{title}</h3>
          <button type="button" className="modal__close" aria-label={t("common.close")} onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
