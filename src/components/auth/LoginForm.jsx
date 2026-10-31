import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import FormField from "../ui/FormField";
import PasswordInput from "../ui/PasswordInput";
import OAuthButtons from "./OAuthButtons";
import errorText from "../../utils/errorText";

export default function LoginForm() {
  const { t } = useTranslation();
  const { login, oauth, providers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  // OAuth уводит браузер на страницу Google/GitHub, поэтому busy не сбрасываем при успехе.
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

  return (
    <form className="form-card" onSubmit={submit}>
      <h1>{t("auth.loginTitle")}</h1>
      <FormField label={t("auth.email")}>
        <input className="input" type="email" value={form.email} onChange={set("email")} required autoComplete="email" disabled={busy} />
      </FormField>
      <FormField label={t("auth.password")}>
        <PasswordInput value={form.password} onChange={set("password")} required autoComplete="current-password" disabled={busy} />
      </FormField>
      {error && <p className="field__error" role="alert">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>
        {busy ? t("common.loading") : t("auth.submitLogin")}
      </button>
      {providers.length > 0 && <OAuthButtons providers={providers} onSelect={social} disabled={busy} />}
      <p className="center">
        {t("auth.noAccount")} <Link to="/register">{t("nav.register")}</Link>
      </p>
    </form>
  );
}
