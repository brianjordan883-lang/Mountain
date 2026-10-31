import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import WhatsAppButton from "./WhatsAppButton";
import AmenityList from "./cottages/AmenityList";
import PriceRow from "./cottages/PriceRow";
import useCottageText from "../hooks/useCottageText";

export default function CottageCard({ cottage }) {
  const { t } = useTranslation();
  const { slug, name, images, amenities, price, capacity } = cottage;
  const { tier, tagline, description } = useCottageText()(cottage);

  return (
    <article className="card">
      <Link to={`/cottages/${slug}`} className="card__img" aria-label={name}>
        {images[0] && (
          <img
            src={images[0]}
            alt={t("cottage.imgAlt", { name })}
            loading="lazy"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </Link>
      <div className="card__body">
        <p className="card__tier">{tier}</p>
        <h3>
          <Link to={`/cottages/${slug}`} className="plain-link">{name}</Link>
        </h3>
        {tagline && <p className="muted">{tagline}</p>}
        <p>{description}</p>
        <AmenityList amenities={amenities} />
        <p className="muted">{t("cottage.guestsMax", { count: capacity })}</p>
        <PriceRow price={price} />
        <WhatsAppButton cottage={name} label={t("cta.bookCottage")} />
      </div>
    </article>
  );
}
