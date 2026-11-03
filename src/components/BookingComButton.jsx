import { useTranslation } from "react-i18next";
import { useSettings } from "../hooks/useSettings";

// Кнопка «Забронировать на Booking.com».
// Ссылка на объект задаётся в админке: «Тексты и контакты» → «Ссылка на Booking.com».
// Пока ссылка пустая, кнопка не показывается.
export default function BookingComButton({ label }) {
  const { t } = useTranslation();
  const { contacts } = useSettings();
  const url = (contacts.booking ?? "").trim();

  if (!url) return null;

  return (
    <a
      className="btn btn--booking"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label || t("cta.bookingCom")}
    </a>
  );
}
