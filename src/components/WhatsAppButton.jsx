import { useTranslation } from "react-i18next";
import { openWhatsApp } from "../services/whatsappService";
import { useSettings } from "../hooks/useSettings";

export default function WhatsAppButton({
  cottage = "",
  label,
  message,
  variant = "primary",
}) {
  const { t } = useTranslation();
  const { contacts } = useSettings();

  return (
    <button
      type="button"
      className={`btn ${
        variant === "ghost" ? "btn--ghost" : "btn--primary"
      }`}
      onClick={() => openWhatsApp(cottage, contacts.whatsapp, message)}
    >
      {label || t("cta.whatsapp")}
    </button>
  );
}
