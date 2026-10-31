import { useTranslation } from "react-i18next";
import StarRating from "../ui/StarRating";
import { formatDate } from "../../utils/format";

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Один отзыв. Для исходных отзывов есть переводы, новые показываются как написаны.
export default function ReviewItem({ review }) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const translated = review.translations?.[lang];
  const name = translated?.name || review.name;
  const text = translated?.text || review.text;

  return (
    <figure className="review">
      <div className="review__head">
        <span className="review__avatar" aria-hidden="true">
          {initials(name)}
        </span>
        <div>
          <figcaption className="review__name">{name}</figcaption>
          <span className="muted">{formatDate(review.date, lang)}</span>
        </div>
      </div>
      <StarRating value={review.rating} />
      <blockquote>{text}</blockquote>
    </figure>
  );
}
