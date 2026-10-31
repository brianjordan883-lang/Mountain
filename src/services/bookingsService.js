import { db, unwrap } from "./db";

const COLUMNS = "id, cottage_id, user_id, guest_name, email, phone, check_in, check_out, guests, notes, total, status, created_at";

// Дата без времени: "2026-11-07".
const day = (value) => String(value).slice(0, 10);

const fromRow = (row) => ({
  id: row.id,
  cottageId: row.cottage_id,
  userId: row.user_id,
  guestName: row.guest_name,
  email: row.email,
  phone: row.phone,
  checkIn: day(row.check_in),
  checkOut: day(row.check_out),
  guests: row.guests,
  notes: row.notes,
  total: row.total,
  status: row.status,
  createdAt: row.created_at,
});

// RLS сам отдаёт обычному пользователю только его брони, а админу — все.
export async function listBookings() {
  const rows = unwrap(await db().from("bookings").select(COLUMNS).order("check_in", { ascending: false }));
  return rows.map(fromRow);
}

// Занятые даты домика — без личных данных других гостей.
export async function getBusyRanges(cottageId) {
  const rows = unwrap(await db().rpc("get_busy_ranges", { p_cottage_id: cottageId }));
  return rows.map((r) => ({ checkIn: day(r.check_in), checkOut: day(r.check_out) }));
}

// Сумму считает триггер в базе. Вошедший пользователь может сразу прочитать свою бронь,
// анонимный гость — нет (у него нет прав на чтение броней), поэтому для него вернётся null.
export async function createBooking(data, { canRead }) {
  const row = {
    cottage_id: data.cottageId,
    guest_name: data.guestName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    check_in: data.checkIn,
    check_out: data.checkOut,
    guests: Number(data.guests),
    notes: data.notes.trim(),
  };
  const query = db().from("bookings").insert(row);
  if (!canRead) {
    unwrap(await query);
    return null;
  }
  return fromRow(unwrap(await query.select(COLUMNS).single()));
}

export async function updateBookingStatus(id, status) {
  return fromRow(unwrap(await db().from("bookings").update({ status }).eq("id", id).select(COLUMNS).single()));
}

export async function deleteBooking(id) {
  unwrap(await db().from("bookings").delete().eq("id", id));
}
