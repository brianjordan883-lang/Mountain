import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import FormField from "../ui/FormField";
import PasswordInput from "../ui/PasswordInput";
import OAuthButtons from "./OAuthButtons";
import errorText from "../../utils/errorText";

export default function RegisterForm() {
  const { t } = useTranslation();
  const { register, oauth, providers } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (form.name.trim().length < 2) return setError(t("auth.errors.name"));
    if (form.password.length < 6) return setError(t("auth.errors.short"));
    if (form.password !== form.confirm) return setError(t("auth.errors.mismatch"));
    setBusy(true);
    setError("");
    try {
      const { needsConfirmation } = await register(form);
      if (needsConfirmation) setConfirmSent(true);
      else navigate("/", { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  // Вход через Google/GitHub сразу создаёт аккаунт, отдельная регистрация не нужна.
  const social = async (provider) => {
    setBusy(true);
    setError("");
    try {
      await oauth(provider);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  if (confirmSent)
    return (
      <div className="form-card center" role="status">
        <h1>{t("auth.checkEmailTitle")}</h1>
        <p>{t("auth.checkEmail", { email: form.email })}</p>
        <Link to="/login" className="btn btn--primary">{t("nav.login")}</Link>
      </div>
    );

  return (
    <form className="form-card" onSubmit={submit}>
      <h1>{t("auth.registerTitle")}</h1>
      <FormField label={t("auth.name")}>
        <input className="input" value={form.name} onChange={set("name")} required maxLength={80} autoComplete="name" disabled={busy} />
      </FormField>
      <FormField label={t("auth.email")}>
        <input className="input" type="email" value={form.email} onChange={set("email")} required autoComplete="email" disabled={busy} />
      </FormField>
      <FormField label={t("auth.password")}>
        <PasswordInput value={form.password} onChange={set("password")} required autoComplete="new-password" disabled={busy} />
      </FormField>
      <FormField label={t("auth.confirm")}>
        <PasswordInput value={form.confirm} onChange={set("confirm")} required autoComplete="new-password" disabled={busy} />
      </FormField>
      {error && <p className="field__error" role="alert">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>
        {busy ? t("common.loading") : t("auth.submitRegister")}
      </button>
      {providers.length > 0 && <OAuthButtons providers={providers} onSelect={social} disabled={busy} />}
      <p className="center">
        {t("auth.haveAccount")} <Link to="/login">{t("nav.login")}</Link>
      </p>
    </form>
  );
}
