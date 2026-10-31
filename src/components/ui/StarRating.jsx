import { useTranslation } from "react-i18next";

export default function StarRating({ value }) {
  const { t } = useTranslation();
  const full = Math.round(value);
  return (
    <span className="stars" role="img" aria-label={t("reviews.rating", { rating: value })}>
      {"★".repeat(full)}
      <span className="stars__off">{"★".repeat(5 - full)}</span>
    </span>
  );
}
