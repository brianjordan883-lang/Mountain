import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../hooks/useData";
import { useToast } from "../../hooks/useToast";
import FormField from "../ui/FormField";
import StarInput from "../ui/StarInput";
import errorText from "../../utils/errorText";

const EMPTY = { name: "", text: "", rating: 0, cottageId: "" };

// Те же ограничения, что и в базе (supabase/schema.sql, таблица reviews).
function validate(form) {
  const errors = {};
  const name = form.name.trim();
  const text = form.text.trim();
  if (name.length < 2 || name.length > 60) errors.name = "name";
  if (text.length < 10 || text.length > 1000) errors.text = "text";
  if (!Number.isInteger(form.rating) || form.rating < 1 || form.rating > 5) errors.rating = "rating";
  return errors;
}

export default function ReviewForm({ cottageId = null }) {
  const { t } = useTranslation();
  const { cottages, submitReview } = useData();
  const { push } = useToast();
  const [form, setForm] = useState({ ...EMPTY, cottageId: cottageId ?? "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [serverError, setServerError] = useState("");

  const set = (key) => (value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (status !== "sending") setStatus("idle");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status === "sending") return; // защита от двойного нажатия
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("sending");
    setServerError("");
    try {
      await submitReview({ ...form, cottageId: form.cottageId ? Number(form.cottageId) : null });
      setForm({ ...EMPTY, cottageId: cottageId ?? "" });
      setStatus("sent");
      push(t("reviews.form.success"));
    } catch (error) {
      setServerError(errorText(error));
      setStatus("error");
    }
  };

  const sending = status === "sending";

  return (
    <form id="review-form" className="form-card review-form" onSubmit={submit} noValidate>
      <h3>{t("reviews.form.title")}</h3>
      <p className="muted">{t("reviews.form.moderationNote")}</p>

      <FormField label={t("reviews.form.name")} error={errors.name && t("reviews.form.errors.name")}>
        <input className="input" value={form.name} maxLength={60} onChange={(e) => set("name")(e.target.value)} disabled={sending} autoComplete="name" />
      </FormField>

      {!cottageId && (
        <FormField label={t("reviews.form.cottage")}>
          <select className="input" value={form.cottageId} onChange={(e) => set("cottageId")(e.target.value)} disabled={sending}>
            <option value="">{t("reviews.form.general")}</option>
            {cottages.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </FormField>
      )}

      <div className="field">
        <span className="field__label">{t("reviews.form.rating")}</span>
        <StarInput value={form.rating} onChange={set("rating")} disabled={sending} />
        {errors.rating && <span className="field__error" role="alert">{t("reviews.form.errors.rating")}</span>}
      </div>

      <FormField label={t("reviews.form.text")} error={errors.text && t("reviews.form.errors.text")}>
        <textarea className="input" rows="4" value={form.text} maxLength={1000} onChange={(e) => set("text")(e.target.value)} disabled={sending} />
        <span className="muted field__hint">{form.text.trim().length} / 1000</span>
      </FormField>

      {status === "error" && <p className="field__error" role="alert">{serverError}</p>}
      {status === "sent" && <p className="form-success" role="status">{t("reviews.form.success")}</p>}

      <button className="btn btn--primary" type="submit" disabled={sending}>
        {sending ? t("reviews.form.sending") : t("reviews.form.send")}
      </button>
    </form>
  );
}
