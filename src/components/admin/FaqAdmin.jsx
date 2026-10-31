import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../hooks/useData";
import { useToast } from "../../hooks/useToast";
import FormField from "../ui/FormField";
import EmptyState from "../ui/EmptyState";
import errorText from "../../utils/errorText";

const LANGS = ["ru", "en", "kg"];
const toForm = (faq, lang) =>
  faq ? { ...faq, keywords: faq.keywords.join(", ") } : { lang, question: "", answer: "", keywords: "", hidden: false, sortOrder: 0 };
const fromForm = (form) => ({
  ...form,
  keywords: form.keywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean),
});

function FaqEditor({ faq, lang, onDone }) {
  const { t } = useTranslation();
  const { addFaq, updateFaq } = useData();
  const { push } = useToast();
  const [form, setForm] = useState(() => toForm(faq, lang));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!form.question.trim() || !form.answer.trim()) return setError(t("admin.content.errors.faq"));
    setSaving(true);
    setError("");
    try {
      if (faq) await updateFaq(faq.id, fromForm(form));
      else await addFaq(fromForm(form));
      push(t(faq ? "admin.saved" : "admin.added"));
      onDone();
    } catch (err) {
      setError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <form className="faq-editor" onSubmit={submit} noValidate>
      <FormField label={t("admin.content.question")}>
        <input className="input" value={form.question} maxLength={200} onChange={set("question")} />
      </FormField>
      <FormField label={t("admin.content.answer")}>
        <textarea className="input" rows="3" value={form.answer} maxLength={2000} onChange={set("answer")} />
      </FormField>
      <FormField label={t("admin.content.keywords")}>
        <input className="input" value={form.keywords} onChange={set("keywords")} />
      </FormField>
      <div className="form-row">
        <FormField label={t("admin.content.order")}>
          <input className="input" type="number" value={form.sortOrder} onChange={set("sortOrder")} />
        </FormField>
        <label className="check">
          <input type="checkbox" checked={form.hidden} onChange={set("hidden")} />
          {t("admin.content.hidden")}
        </label>
      </div>
      {error && <p className="field__error" role="alert">{error}</p>}
      <div className="table__actions">
        <button className="btn btn--sm btn--primary" type="submit" disabled={saving}>
          {saving ? t("admin.form.saving") : t("common.save")}
        </button>
        <button className="btn btn--sm btn--ghost" type="button" onClick={onDone} disabled={saving}>
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

// Вопросы и ответы чат-помощника (таблица faqs), отдельно для каждого языка.
export default function FaqAdmin() {
  const { t } = useTranslation();
  const { faqs, removeFaq } = useData();
  const { push } = useToast();
  const [lang, setLang] = useState("ru");
  const [editingId, setEditingId] = useState(null); // id, "new" или null
  const [busyId, setBusyId] = useState(null);
  const list = faqs.filter((f) => f.lang === lang).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const remove = async (faq) => {
    if (!window.confirm(t("common.confirmDelete", { name: faq.question }))) return;
    setBusyId(faq.id);
    try {
      await removeFaq(faq.id);
      push(t("admin.deleted"));
    } catch (error) {
      push(errorText(error), "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="card admin-card">
      <div className="section__head">
        <h2>{t("admin.content.faq")}</h2>
        <button type="button" className="btn btn--sm btn--primary" onClick={() => setEditingId("new")} disabled={editingId === "new"}>
          + {t("admin.content.addFaq")}
        </button>
      </div>
      <p className="muted">{t("admin.content.faqHint")}</p>
      <div className="admin-tabs" role="tablist">
        {LANGS.map((code) => (
          <button key={code} type="button" role="tab" aria-selected={lang === code} className={`admin-tab ${lang === code ? "active" : ""}`} onClick={() => { setLang(code); setEditingId(null); }}>
            {code.toUpperCase()} ({faqs.filter((f) => f.lang === code).length})
          </button>
        ))}
      </div>

      {editingId === "new" && <FaqEditor key={`new-${lang}`} lang={lang} onDone={() => setEditingId(null)} />}
      {!list.length && editingId !== "new" && <EmptyState text={t("admin.content.faqEmpty")} />}

      <div className="faq-list">
        {list.map((faq) =>
          editingId === faq.id ? (
            <FaqEditor key={faq.id} faq={faq} lang={lang} onDone={() => setEditingId(null)} />
          ) : (
            <article key={faq.id} className="faq-item">
              <div>
                <b>{faq.question}</b> {faq.hidden && <span className="badge">{t("admin.content.hidden")}</span>}
                <p>{faq.answer}</p>
                {faq.keywords.length > 0 && <p className="muted">{faq.keywords.join(", ")}</p>}
              </div>
              <div className="table__actions">
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => setEditingId(faq.id)} disabled={busyId === faq.id}>
                  {t("common.edit")}
                </button>
                <button type="button" className="btn btn--sm btn--danger" onClick={() => remove(faq)} disabled={busyId === faq.id}>
                  {t("common.delete")}
                </button>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}
