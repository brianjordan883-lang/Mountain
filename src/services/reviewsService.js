import { db, unwrap } from "./db";

const COLUMNS = "id, name, text, rating, cottage_id, translations, approved, created_at";

const fromRow = (row) => ({
  id: row.id,
  name: row.name,
  text: row.text,
  rating: row.rating,
  cottageId: row.cottage_id,
  translations: row.translations ?? {},
  approved: row.approved,
  date: row.created_at,
});

// Публичный список: явно только одобренные (админу RLS вернул бы и неодобренные).
export async function listApprovedReviews() {
  const rows = unwrap(await db().from("reviews").select(COLUMNS).eq("approved", true).order("created_at", { ascending: false }));
  return rows.map(fromRow);
}

export async function listAllReviews() {
  const rows = unwrap(await db().from("reviews").select(COLUMNS).order("created_at", { ascending: false }));
  return rows.map(fromRow);
}

// Новый отзыв попадает в базу неодобренным. Без .select(): посетитель не имеет права
// читать неодобренные отзывы, поэтому запрос вернул бы ошибку.
export async function submitReview({ name, text, rating, cottageId }) {
  unwrap(
    await db().from("reviews").insert({
      name: name.trim(),
      text: text.trim(),
      rating,
      cottage_id: cottageId || null,
    })
  );
}

export async function setReviewApproved(id, approved) {
  return fromRow(unwrap(await db().from("reviews").update({ approved }).eq("id", id).select(COLUMNS).single()));
}

const normalizeTranslations = (translations = {}) => {
  const languages = ["ru", "en", "kg"];
  return languages.reduce((acc, lang) => {
    const item = translations[lang] ?? {};
    acc[lang] = {
      name: item.name ?? "",
      text: item.text ?? "",
    };
    return acc;
  }, {});
};

export async function saveReviewTranslations(id, translations) {
  const normalized = normalizeTranslations(translations);
  const row = unwrap(
    await db()
      .from("reviews")
      .update({ translations: normalized })
      .eq("id", id)
      .select(COLUMNS)
      .single()
  );

  return fromRow(row);
}

export async function deleteReview(id) {
  unwrap(await db().from("reviews").delete().eq("id", id));
}
