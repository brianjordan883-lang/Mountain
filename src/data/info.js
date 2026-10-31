// Условия проживания по умолчанию. Актуальные значения редактируются в админ-панели
// и хранятся в таблице site_settings (ключ "stay").
export const extras = {
  extraGuest: 2000,
  dayUse: 10000,
  checkIn: "14:00",
  checkOut: "12:00",
};

// Характеристики, которые можно отметить у домика (подписи — в locales: amenities.*).
export const AMENITIES = ["panorama", "terrace", "breakfast", "bbq"];
export const TIERS = ["premium", "atmosphere", "natural"];
