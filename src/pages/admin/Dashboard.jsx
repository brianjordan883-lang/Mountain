import { useTranslation } from "react-i18next";
import { useData } from "../../hooks/useData";
import useAsync from "../../hooks/useAsync";
import useRating from "../../hooks/useRating";
import { listBookings } from "../../services/bookingsService";
import { listAllReviews } from "../../services/reviewsService";

const loadStats = () => Promise.all([listBookings(), listAllReviews()]);

export default function Dashboard() {
  const { t } = useTranslation();
  const { cottages, reviews } = useData();
  const rating = useRating(reviews);
  const { data, error } = useAsync(loadStats);
  const [bookings, allReviews] = data ?? [];
  const show = (value) => (error ? "—" : value ?? "…");

  const stats = [
    { label: t("admin.totalCottages"), value: cottages.length },
    { label: t("admin.totalBookings"), value: show(bookings?.filter((b) => b.status !== "cancelled").length) },
    { label: t("admin.totalReviews"), value: rating.count },
    { label: t("admin.pendingReviews"), value: show(allReviews?.filter((r) => !r.approved).length) },
    { label: t("admin.stats.rating"), value: rating.count ? rating.avg.toFixed(1) : "—" },
  ];

  return (
    <div className="stack">
      <h1>{t("admin.dashboard")}</h1>
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="card stat-box">
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
