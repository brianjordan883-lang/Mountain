import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function StarInput({ value, onChange, disabled = false }) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="star-input" role="radiogroup" aria-label={t("reviews.form.rating")} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((number) => (
        <button
          key={number}
          type="button"
          role="radio"
          aria-checked={value === number}
          aria-label={t("reviews.rating", { rating: number })}
          className={number <= shown ? "is-on" : ""}
          disabled={disabled}
          onMouseEnter={() => setHover(number)}
          onClick={() => onChange(number)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
