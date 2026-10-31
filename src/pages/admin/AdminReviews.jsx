import { useTranslation } from "react-i18next";
import ReviewsAdmin from "../../components/admin/ReviewsAdmin";

export default function AdminReviews() {
  const { t } = useTranslation();

  return (
    <div className="stack">
      <h1>{t("admin.reviews.title")}</h1>
      <ReviewsAdmin />
    </div>
  );
}
