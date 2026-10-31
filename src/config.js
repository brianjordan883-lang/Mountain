// Значения по умолчанию. Реальные контакты редактируются в админ-панели
// («Тексты и контакты») и хранятся в таблице site_settings.
export const WHATSAPP_NUMBER = "996555123456";
export const INSTAGRAM_URL = "https://www.instagram.com/calma.mountain/";
// Точка на карте (2ГИС). Можно поменять в админке: «Тексты и контакты» → «Ссылка на карту».
export const MAP_URL = "https://go.2gis.com/zMFNm";
export const CONTACT = { phone: "+996 555 123 456", address: "Кыргызстан, горная местность" };

export const DEFAULT_CONTACTS = {
  phone: CONTACT.phone,
  whatsapp: WHATSAPP_NUMBER,
  instagram: INSTAGRAM_URL,
  email: "",
  address: { ru: CONTACT.address, en: "", kg: "" },
  map: MAP_URL,
};
