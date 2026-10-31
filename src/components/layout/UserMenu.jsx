import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";

export default function UserMenu({ onNavigate }) {
  const { t } = useTranslation();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!user)
    return (
      <Link to="/login" className="btn btn--ghost user-menu__login" onClick={onNavigate}>
        {t("nav.login")}
      </Link>
    );

  return (
    <div className="user-menu">
      <span className="user-menu__name">{user.name}</span>
      <Link to="/my-bookings" onClick={onNavigate}>{t("nav.myBookings")}</Link>
      {isAdmin && <Link to="/admin" onClick={onNavigate}>{t("nav.admin")}</Link>}
      <button
        type="button"
        className="link-btn"
        onClick={async () => {
          onNavigate?.();
          await logout();
          navigate("/");
        }}
      >
        {t("nav.logout")}
      </button>
    </div>
  );
}
