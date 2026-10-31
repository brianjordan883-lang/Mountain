import { useMemo } from "react";

// Средняя оценка и количество по реальным (одобренным) отзывам.
// cottageId не задан — считаем по всем отзывам.
export default function useRating(reviews, cottageId) {
  return useMemo(() => {
    const list = cottageId ? reviews.filter((r) => r.cottageId === cottageId) : reviews;
    const count = list.length;
    const avg = count ? list.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    return { count, avg: Math.round(avg * 10) / 10 };
  }, [reviews, cottageId]);
}
