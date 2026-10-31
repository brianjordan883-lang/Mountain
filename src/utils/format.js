export const formatSom = (n) => `${Number(n).toLocaleString("ru-RU")} сом`;

export const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "cottage";

// Для кыргызского языка браузеры знают код "ky", а не "kg".
const locale = (lang) => (lang === "kg" ? "ky" : lang || "ru");

export const formatDate = (iso, lang) =>
  iso ? new Date(iso).toLocaleDateString(locale(lang), { day: "numeric", month: "long", year: "numeric" }) : "";

// Текст на нужном языке из объекта {ru, en, kg}; если перевода нет — русский.
export const pickLang = (value, lang) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.ru || Object.values(value).find(Boolean) || "";
};
