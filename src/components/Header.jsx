import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import WhatsAppButton from "./WhatsAppButton";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./layout/ThemeToggle";
import UserMenu from "./layout/UserMenu";

const links = [
  { to: "/", key: "home" },
  { to: "/cottages", key: "cottages" },
  { to: "/#pricing", key: "prices" },
  { to: "/gallery", key: "gallery" },
  { to: "/#reviews", key: "reviews" },
  { to: "/contacts", key: "contacts" },
];

export default function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo" onClick={close}>Calma Mountain</Link>
        <button
          className="burger"
          aria-label={t("nav.menu")}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`nav ${open ? "nav--open" : ""}`}>
          {links.map((link) =>
            link.to.includes("#") ? (
              <a key={link.to} href={link.to} onClick={close}>{t(`nav.${link.key}`)}</a>
            ) : (
              <NavLink key={link.to} to={link.to} end={link.to === "/"} onClick={close}>
                {t(`nav.${link.key}`)}
              </NavLink>
            )
          )}
          <UserMenu onNavigate={close} />
          <WhatsAppButton label={t("nav.book")} />
        </nav>
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
