import { useState } from "react";
import { useTranslation } from "react-i18next";

// Поле пароля с кнопкой-«глазом»: нажал — пароль виден, нажал ещё раз — снова скрыт.
export default function PasswordInput({ className = "input", ...props }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const label = visible ? t("auth.hidePassword") : t("auth.showPassword");

  return (
    <span className="password-input">
      <input {...props} className={className} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        aria-pressed={visible}
        title={label}
        disabled={props.disabled}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          {visible && <path d="M4 4l16 16" />}
        </svg>
      </button>
    </span>
  );
}
