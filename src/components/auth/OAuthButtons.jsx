import { useTranslation } from "react-i18next";

// Показываются только провайдеры из VITE_AUTH_PROVIDERS (те, что настроены в Supabase).
export default function OAuthButtons({ providers, onSelect, disabled }) {
  const { t } = useTranslation();
  return (
    <div className="oauth">
      <p className="muted center">{t("auth.or")}</p>
      {providers.map((provider) => (
        <button key={provider} type="button" className="btn btn--light oauth__btn" disabled={disabled} onClick={() => onSelect(provider)}>
          {t(`auth.${provider}`)}
        </button>
      ))}
    </div>
  );
}
