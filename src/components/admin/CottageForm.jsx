import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AMENITIES, TIERS } from "../../data/info";
import FormField from "../ui/FormField";
import Modal from "../ui/Modal";
import ImageUpload from "../ui/ImageUpload";
import { removeImages } from "../../services/storageService";
import errorText from "../../utils/errorText";

const LANGS = ["ru", "en", "kg"];

const emptyCottage = {
  name: "",
  tier: "premium",
  tagline: { ru: "", en: "", kg: "" },
  description: { ru: "", en: "", kg: "" },
  amenities: ["panorama", "terrace"],
  images: [],
  price: { weekday: "", weekend: "" },
  capacity: 3,
};

function validate(form) {
  const errors = {};
  if (!form.name.trim() || form.name.trim().length > 60) errors.name = "required";
  if (!form.description.ru.trim()) errors.description = "required";
  for (const key of ["weekday", "weekend"]) {
    const n = Number(form.price[key]);
    if (form.price[key] === "" || !Number.isInteger(n) || n < 0) errors[key] = "price";
  }
  const capacity = Number(form.capacity);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20) errors.capacity = "capacity";
  return errors;
}

// Форма добавления и редактирования домика. onSave должен вернуть Promise.
export default function CottageForm({ title, cottage, onSave, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => (cottage ? structuredClone(cottage) : structuredClone(emptyCottage)));
  const [lang, setLang] = useState("ru");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState("");
  // Фото, загруженные в этой форме: если нажать «Отмена», их нужно удалить из хранилища.
  const uploaded = useRef([]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setNested = (key, sub, value) => setForm((f) => ({ ...f, [key]: { ...f[key], [sub]: value } }));
  const toggleAmenity = (a) =>
    set("amenities", form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);

  const submit = async (event) => {
    event.preventDefault();
    if (saving || uploading) return;
    const found = validate(form);
    setErrors(found);
    if (found.description) setLang("ru");
    if (Object.keys(found).length) return;

    setSaving(true);
    setServerError("");
    try {
      await onSave(form);
      // Фото, загруженные и затем убранные из формы до сохранения, больше не нужны.
      const unused = uploaded.current.filter((url) => !form.images.includes(url));
      if (unused.length) removeImages(unused).catch((e) => console.error("Unused image cleanup failed:", e));
      uploaded.current = [];
    } catch (error) {
      setServerError(errorText(error));
      setSaving(false);
    }
  };

  const cancel = () => {
    if (saving) return;
    const orphaned = uploaded.current.filter((url) => !cottage?.images.includes(url));
    if (orphaned.length) removeImages(orphaned).catch((e) => console.error("Orphan cleanup failed:", e));
    onCancel();
  };

  const err = (key, text) => errors[key] && t(text);

  return (
    <Modal title={title} onClose={cancel}>
      <form onSubmit={submit} noValidate className="admin-form">
        <FormField label={t("admin.form.name")} error={err("name", "admin.form.errors.name")}>
          <input className="input" value={form.name} maxLength={60} onChange={(e) => set("name", e.target.value)} />
        </FormField>

        <div className="form-row">
          <FormField label={t("admin.form.tier")}>
            <select className="input" value={form.tier} onChange={(e) => set("tier", e.target.value)}>
              {TIERS.map((tier) => (
                <option key={tier} value={tier}>{t(`tiers.${tier}`)}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t("admin.form.capacity")} error={err("capacity", "admin.form.errors.capacity")}>
            <input className="input" type="number" min="1" max="20" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
          </FormField>
        </div>

        <div className="form-row">
          <FormField label={t("admin.form.priceWeekday")} error={err("weekday", "admin.form.errors.price")}>
            <input className="input" type="number" min="0" step="100" value={form.price.weekday} onChange={(e) => setNested("price", "weekday", e.target.value)} />
          </FormField>
          <FormField label={t("admin.form.priceWeekend")} error={err("weekend", "admin.form.errors.price")}>
            <input className="input" type="number" min="0" step="100" value={form.price.weekend} onChange={(e) => setNested("price", "weekend", e.target.value)} />
          </FormField>
        </div>

        <fieldset className="field">
          <legend className="field__label">{t("admin.form.amenities")}</legend>
          <div className="checks">
            {AMENITIES.map((a) => (
              <label key={a} className="check">
                <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                {t(`amenities.${a}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="admin-tabs" role="tablist" aria-label={t("nav.language")}>
          {LANGS.map((code) => (
            <button key={code} type="button" role="tab" aria-selected={lang === code} className={`admin-tab ${lang === code ? "active" : ""}`} onClick={() => setLang(code)}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <FormField label={`${t("admin.form.tagline")} (${lang.toUpperCase()})`}>
          <input className="input" value={form.tagline[lang] ?? ""} maxLength={120} onChange={(e) => setNested("tagline", lang, e.target.value)} />
        </FormField>
        <FormField label={`${t("admin.form.description")} (${lang.toUpperCase()})`} error={lang === "ru" && err("description", "admin.form.errors.description")}>
          <textarea className="input" rows="4" maxLength={2000} value={form.description[lang] ?? ""} onChange={(e) => setNested("description", lang, e.target.value)} />
        </FormField>

        <div className="field">
          <span className="field__label">{t("admin.form.image")}</span>
          <ImageUpload
            value={form.images}
            onChange={(update) => setForm((f) => ({ ...f, images: update(f.images) }))}
            onUploaded={(url) => uploaded.current.push(url)}
            onBusyChange={setUploading}
          />
        </div>

        {serverError && <p className="field__error" role="alert">{serverError}</p>}
        <div className="table__actions">
          <button className="btn btn--primary" type="submit" disabled={saving || uploading}>
            {saving ? t("admin.form.saving") : t("common.save")}
          </button>
          <button className="btn btn--ghost" type="button" onClick={cancel} disabled={saving}>
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
