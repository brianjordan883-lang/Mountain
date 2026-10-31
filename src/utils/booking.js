const DAY = 24 * 60 * 60 * 1000;
const toDate = (iso) => new Date(`${iso}T00:00:00`);

export const todayIso = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export function countNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((toDate(checkOut) - toDate(checkIn)) / DAY));
}

// Предварительный расчёт для показа гостю. Окончательную сумму считает база
// (триггер bookings_set_total в supabase/schema.sql) по тем же правилам.
export function calcTotal(cottage, checkIn, checkOut, guests = 2, extraGuest = 0) {
  const nights = countNights(checkIn, checkOut);
  if (!cottage || nights <= 0) return 0;

  let sum = 0;
  for (let i = 0; i < nights; i++) {
    const day = new Date(toDate(checkIn).getTime() + i * DAY).getDay();
    const weekend = day === 5 || day === 6;
    sum += weekend ? cottage.price.weekend : cottage.price.weekday;
    if (guests > 2) sum += Number(extraGuest) || 0;
  }
  return sum;
}

// busy — занятые интервалы [{ checkIn, checkOut }], дата выезда сама по себе свободна.
export function isAvailable(busy, checkIn, checkOut) {
  return !busy.some((b) => checkIn < b.checkOut && checkOut > b.checkIn);
}

export function validateDates(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "dates";
  if (checkIn < todayIso()) return "past";
  if (checkOut <= checkIn) return "order";
  return null;
}
