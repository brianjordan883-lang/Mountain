import { useTranslation } from "react-i18next";
import WhatsAppButton from "../components/WhatsAppButton";
import BookingComButton from "../components/BookingComButton";
import { useSettings } from "../hooks/useSettings";
import { pickLang } from "../utils/format";
import { mapLink } from "../utils/maps";

export default function Contacts() {
  const { t, i18n } = useTranslation();
  const { contacts, stay } = useSettings();
  const address = pickLang(contacts.address, i18n.resolvedLanguage) || t("contacts.addressValue");

  return (
    <section className="section page">
      <div className="container narrow">
        <h1>{t("contacts.title")}</h1>
        <p>{t("contacts.text")}</p>
        {contacts.phone && (
          <p>
            {t("contacts.phone")}: <a href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}>{contacts.phone}</a>
          </p>
        )}
        {contacts.email && (
          <p>
            Email: <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
          </p>
        )}
        <p>
          {t("contacts.address")}: {address}{" "}
          <a href={mapLink(contacts, address)} target="_blank" rel="noreferrer">{t("contacts.openMap")} →</a>
        </p>
        <p>{t("pricing.times", { in: stay.checkIn, out: stay.checkOut })}</p>
        {contacts.instagram && (
          <p>
            <a href={contacts.instagram} target="_blank" rel="noreferrer">
              Instagram: @calma.mountain
            </a>
          </p>
        )}
        <div className="row">
          <WhatsAppButton />
          <BookingComButton />
        </div>
      </div>
    </section>
  );
}
