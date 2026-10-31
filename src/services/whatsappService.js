import i18n from "../i18n";
import { WHATSAPP_NUMBER } from "../config";
import { formatDate, formatSom } from "../utils/format";

export function buildMessage(cottageName) {
  if (!cottageName) return i18n.t("whatsapp.general");
  return i18n.t(`whatsapp.houses.${cottageName.toLowerCase()}`, {
    defaultValue: i18n.t("whatsapp.cottage", { name: cottageName }),
  });
}

// Данные брони строками «название: значение».
// Один и тот же список показывается на экране «Бронь создана» и уходит в WhatsApp —
// поэтому слова и цифры там всегда совпадают.
// booking = { id, name, checkIn, checkOut, nights, guests, guestName, phone, total }
export function bookingDetails(booking) {
  const t = (key) => i18n.t(`whatsapp.booking.${key}`);
  const lang = i18n.language;
  const rows = [];
  if (booking.id) rows.push({ key: "id", label: t("id"), value: `#${booking.id}` });
  rows.push(
    { key: "cottage", label: t("cottage"), value: booking.name },
    { key: "checkIn", label: t("checkIn"), value: formatDate(booking.checkIn, lang) },
    { key: "checkOut", label: t("checkOut"), value: formatDate(booking.checkOut, lang) },
    { key: "nights", label: t("nights"), value: String(booking.nights) },
    { key: "guests", label: t("guests"), value: String(booking.guests) },
    { key: "guestName", label: t("guestName"), value: booking.guestName },
  );
  if (booking.phone) rows.push({ key: "phone", label: t("phone"), value: booking.phone });
  rows.push(
    { key: "total", label: t("total"), value: formatSom(booking.total) },
    { key: "status", label: t("status"), value: t("pending") },
  );
  return rows;
}

// Сообщение администратору после брони на сайте.
export function buildBookingMessage(booking) {
  const lines = bookingDetails(booking).map((row) => `${row.label}: ${row.value}`);
  return [i18n.t("whatsapp.booking.intro"), ...lines].join("\n");
}

// number — номер из настроек сайта (админ-панель), по умолчанию — из config.js.
// message — готовый текст; если не передан, берётся шаблон по названию домика.
export function buildWhatsAppUrl(cottageName, number = WHATSAPP_NUMBER, message) {
  const text = message || buildMessage(cottageName);
  return `https://wa.me/${number || WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(cottageName, number, message) {
  window.open(buildWhatsAppUrl(cottageName, number, message), "_blank", "noopener,noreferrer");
}
