import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../hooks/useSettings";
import { pickLang } from "../utils/format";
import { mapLink } from "../utils/maps";
import InstagramIcon from "./InstagramIcon";
import WhatsAppButton from "./WhatsAppButton";

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export default function Footer() {
  const { t, i18n } = useTranslation();
  const { contacts } = useSettings();
  // Адрес меняется в админке: «Тексты и контакты» (на RU / KG / EN)
  const address = pickLang(contacts.address, i18n.resolvedLanguage) || t("contacts.addressValue");

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="logo">Calma Mountain</div>
          <a href={contacts.instagram} target="_blank" rel="noreferrer" className="btn--icon-link">
            <InstagramIcon size={18} /> @calma.mountain
          </a>
          {contacts.phone && (
            <a href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`} className="footer__phone">{contacts.phone}</a>
          )}
        </div>

        <address className="footer__address">
          <span className="footer__address-icon"><PinIcon /></span>
          <span>
            <span className="footer__label">{t("contacts.address")}</span>
            <span className="footer__address-text">{address}</span>
            <a href={mapLink(contacts, address)} target="_blank" rel="noreferrer" className="footer__map-link">
              {t("contacts.openMap")} →
            </a>
          </span>
        </address>

        <nav className="footer__nav">
          <Link to="/#cottages">{t("nav.cottages")}</Link>
          <Link to="/contacts">{t("nav.contacts")}</Link>
        </nav>
        <WhatsAppButton label="WhatsApp" />
      </div>
    </footer>
  );
}
