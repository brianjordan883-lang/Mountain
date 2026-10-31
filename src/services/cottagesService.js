import { db, unwrap } from "./db";

const COLUMNS = "id, slug, name, tier, tagline, description, amenities, images, price_weekday, price_weekend, capacity, sort_order";

// Строка БД → объект, с которым работают компоненты (форма как в исходном проекте: price.weekday).
const fromRow = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  tier: row.tier,
  tagline: row.tagline ?? {},
  description: row.description ?? {},
  amenities: row.amenities ?? [],
  images: row.images ?? [],
  price: { weekday: row.price_weekday, weekend: row.price_weekend },
  capacity: row.capacity,
  sortOrder: row.sort_order,
});

const toRow = (c) => ({
  name: c.name.trim(),
  tier: c.tier,
  tagline: c.tagline,
  description: c.description,
  amenities: c.amenities,
  images: c.images,
  price_weekday: Number(c.price.weekday),
  price_weekend: Number(c.price.weekend),
  capacity: Number(c.capacity),
});

export async function listCottages() {
  const rows = unwrap(await db().from("cottages").select(COLUMNS).order("sort_order").order("id"));
  return rows.map(fromRow);
}

export async function createCottage(data) {
  const row = { ...toRow(data), slug: data.slug, sort_order: data.sortOrder ?? 0 };
  return fromRow(unwrap(await db().from("cottages").insert(row).select(COLUMNS).single()));
}

export async function updateCottage(id, data) {
  return fromRow(unwrap(await db().from("cottages").update(toRow(data)).eq("id", id).select(COLUMNS).single()));
}

export async function deleteCottage(id) {
  unwrap(await db().from("cottages").delete().eq("id", id));
}
