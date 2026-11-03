import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import useCottageText from "../hooks/useCottageText";
import useRating from "../hooks/useRating";
import DataState from "../components/ui/DataState";
import AmenityList from "../components/cottages/AmenityList";
import PriceRow from "../components/cottages/PriceRow";
import WhatsAppButton from "../components/WhatsAppButton";
import BookingComButton from "../components/BookingComButton";
import ReviewItem from "../components/reviews/ReviewItem";
import RatingSummary from "../components/reviews/RatingSummary";

function Details({ slug }) {
  const { t } = useTranslation();
  const { cottages, reviews } = useData();
  const text = useCottageText();
  const cottage = cottages.find((item) => item.slug === slug);
  const cottageReviews = reviews.filter((r) => r.cottageId === cottage?.id);
  const rating = useRating(cottageReviews);

  if (!cottage) {
    return (
      <div className="container narrow center">
        <h1>{t("details.notFound")}</h1>
        <Link to="/cottages" className="btn btn--primary">{t("details.backToList")}</Link>
      </div>
    );
  }

  const { tier, tagline, description } = text(cottage);

  return (
    <div className="container">
      <Link to="/cottages" className="muted">{t("details.back")}</Link>
      <div className="cottage-detail">
        <div className="cottage-detail__gallery">
          {cottage.images.length ? (
            cottage.images.map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={t("details.photoAlt", { name: cottage.name, n: index + 1 })} loading="lazy" />
            ))
          ) : (
            <div className="details__img" />
          )}
        </div>
        <div className="cottage-detail__content">
          <p className="eyebrow">{tier}</p>
          <h1>{cottage.name}</h1>
          {tagline && <p className="muted">{tagline}</p>}
          <p>{description}</p>
          <AmenityList amenities={cottage.amenities} />
          <p className="muted">{t("cottage.guestsMax", { count: cottage.capacity })}</p>
          <PriceRow price={cottage.price} />
          <div className="row">
            <Link className="btn btn--primary" to={`/booking?cottage=${encodeURIComponent(slug)}`}>
              {t("cta.bookCottage")}
            </Link>
            <BookingComButton label={t("cta.bookingComShort")} />
            <WhatsAppButton cottage={cottage.name} variant="ghost" label={t("cta.ask")} />
          </div>
        </div>
      </div>

      <h2>{t("details.reviews")}</h2>
      <RatingSummary avg={rating.avg} count={rating.count} />
      {cottageReviews.length > 0 && (
        <div className="grid grid--reviews">
          {cottageReviews.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CottageDetails() {
  const { slug } = useParams();

  // Сначала ждём загрузки данных и только потом решаем, что домик «не найден».
  return (
    <section className="section page">
      <DataState>
        <Details slug={slug} />
      </DataState>
    </section>
  );
}
