import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? t("theme.toLight") : t("theme.toDark")}
      title={dark ? t("theme.toLight") : t("theme.toDark")}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
