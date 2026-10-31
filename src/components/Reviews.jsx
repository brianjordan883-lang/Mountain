import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import useRating from "../hooks/useRating";
import DataState from "./ui/DataState";
import EmptyState from "./ui/EmptyState";
import ReviewItem from "./reviews/ReviewItem";
import ReviewForm from "./reviews/ReviewForm";
import RatingSummary from "./reviews/RatingSummary";

export default function Reviews() {
  const { t } = useTranslation();
  const { reviews } = useData();
  const rating = useRating(reviews);

  return (
    <section className="section" id="reviews">
      <div className="container">
        <h2 className="center">{t("reviews.title")}</h2>
        <DataState skeleton="reviews" count={3}>
          <RatingSummary avg={rating.avg} count={rating.count} />
          <p className="center">
            <a href="#review-form" className="btn btn--primary">
              {t("reviews.form.title")}
            </a>
          </p>
          {reviews.length ? (
            <div className="grid grid--reviews">
              {reviews.map((r) => (
                <ReviewItem key={r.id} review={r} />
              ))}
            </div>
          ) : (
            <EmptyState text={t("reviews.empty")} />
          )}
          <ReviewForm />
        </DataState>
      </div>
    </section>
  );
}
