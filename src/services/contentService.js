import { db, unwrap } from "./db";

// ----- Настройки сайта: контакты и условия проживания -----

export async function getSettings() {
  const rows = unwrap(await db().from("site_settings").select("key, value"));
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function saveSetting(key, value) {
  const row = unwrap(await db().from("site_settings").upsert({ key, value }).select("key, value").single());
  return row.value;
}

// ----- FAQ для чат-помощника -----

const FAQ_COLUMNS = "id, lang, question, answer, keywords, hidden, sort_order";

const fromRow = (row) => ({
  id: row.id,
  lang: row.lang,
  question: row.question,
  answer: row.answer,
  keywords: row.keywords ?? [],
  hidden: row.hidden,
  sortOrder: row.sort_order,
});

const toRow = (f) => ({
  lang: f.lang,
  question: f.question.trim(),
  answer: f.answer.trim(),
  keywords: f.keywords,
  hidden: Boolean(f.hidden),
  sort_order: Number(f.sortOrder) || 0,
});

export async function listFaqs() {
  const rows = unwrap(await db().from("faqs").select(FAQ_COLUMNS).order("sort_order").order("id"));
  return rows.map(fromRow);
}

export async function createFaq(data) {
  return fromRow(unwrap(await db().from("faqs").insert(toRow(data)).select(FAQ_COLUMNS).single()));
}

export async function updateFaq(id, data) {
  return fromRow(unwrap(await db().from("faqs").update(toRow(data)).eq("id", id).select(FAQ_COLUMNS).single()));
}

export async function deleteFaq(id) {
  unwrap(await db().from("faqs").delete().eq("id", id));
}
