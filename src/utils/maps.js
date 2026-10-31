// Ссылка «Открыть на карте».
// 1) Если в админке указана ссылка на карту (2ГИС, Google) — ведём прямо на эту точку.
// 2) Если нет — ищем адрес в Google Картах.
export const mapUrl = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

export const mapLink = (contacts, address) => contacts?.map?.trim() || mapUrl(address);
