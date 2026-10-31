import { useTranslation } from "react-i18next";
import StarRating from "../ui/StarRating";

export default function RatingSummary({ avg, count }) {
  const { t } = useTranslation();
  if (!count) return <p className="center muted">{t("reviews.noRating")}</p>;

  return (
    <div className="rating-summary">
      <span className="rating-summary__avg">{avg.toFixed(1)}</span>
      <StarRating value={avg} />
      <span className="muted">{t("reviews.count", { count })}</span>
    </div>
  );
}
