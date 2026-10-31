import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminLayout() {
  const { t } = useTranslation();
  const nav = [
    { to: "/admin", label: t("admin.dashboard") },
    { to: "/admin/cottages", label: t("admin.cottages") },
    { to: "/admin/bookings", label: t("admin.bookings") },
    { to: "/admin/reviews", label: t("admin.reviews.title") },
    { to: "/admin/content", label: t("admin.content.title") },
  ];

  return (
    <section className="section page">
      <div className="container admin-layout">
        <aside className="admin-sidebar">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/admin"} className={({ isActive }) => isActive ? "admin-link admin-link--active" : "admin-link"}>
              {item.label}
            </NavLink>
          ))}
        </aside>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
