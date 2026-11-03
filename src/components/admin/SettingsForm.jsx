import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../hooks/useData";
import { useToast } from "../../hooks/useToast";
import FormField from "../ui/FormField";
import errorText from "../../utils/errorText";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function validate(contacts, stay) {
  const errors = {};
  if (!/^\d{9,15}$/.test(contacts.whatsapp)) errors.whatsapp = "admin.content.errors.whatsapp";
  if (contacts.instagram && !/^https:\/\//.test(contacts.instagram)) errors.instagram = "admin.content.errors.url";
  if (contacts.map && !/^https:\/\//.test(contacts.map.trim())) errors.map = "admin.content.errors.url";
  if (contacts.booking && !/^https:\/\//.test(contacts.booking.trim())) errors.booking = "admin.content.errors.url";
  if (!TIME.test(stay.checkIn)) errors.checkIn = "admin.content.errors.time";
  if (!TIME.test(stay.checkOut)) errors.checkOut = "admin.content.errors.time";
  for (const key of ["extraGuest", "dayUse"]) {
    const n = Number(stay[key]);
    if (stay[key] === "" || !Number.isInteger(n) || n < 0) errors[key] = "admin.form.errors.price";
  }
  return errors;
}

// Контакты и условия проживания — таблица site_settings.
export default function SettingsForm() {
  const { t } = useTranslation();
  const { settings, saveSettings } = useData();
  const { push } = useToast();
  const [contacts, setContacts] = useState(() => structuredClone(settings.contacts));
  const [stay, setStay] = useState(() => ({ ...settings.stay }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setC = (key) => (e) => setContacts((c) => ({ ...c, [key]: e.target.value }));
  const setAddress = (lang) => (e) => setContacts((c) => ({ ...c, address: { ...c.address, [lang]: e.target.value } }));
  const setS = (key) => (e) => setStay((s) => ({ ...s, [key]: e.target.value }));
  const err = (key) => errors[key] && t(errors[key]);

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const found = validate(contacts, stay);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await saveSettings("contacts", { ...contacts, phone: contacts.phone.trim(), email: contacts.email.trim(), map: (contacts.map ?? "").trim(), booking: (contacts.booking ?? "").trim() });
      await saveSettings("stay", { ...stay, extraGuest: Number(stay.extraGuest), dayUse: Number(stay.dayUse) });
      push(t("admin.saved"));
    } catch (error) {
      push(errorText(error), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card admin-card" onSubmit={submit} noValidate>
      <h2>{t("admin.content.contacts")}</h2>
      <div className="form-row">
        <FormField label={t("contacts.phone")}>
          <input className="input" value={contacts.phone} maxLength={30} onChange={setC("phone")} />
        </FormField>
        <FormField label={t("admin.content.whatsapp")} error={err("whatsapp")}>
          <input className="input" value={contacts.whatsapp} inputMode="numeric" placeholder="996997202080" onChange={(e) => setContacts((c) => ({ ...c, whatsapp: e.target.value.replace(/\D/g, "") }))} />
        </FormField>
      </div>
      <div className="form-row">
        <FormField label="Instagram" error={err("instagram")}>
          <input className="input" type="url" value={contacts.instagram} onChange={setC("instagram")} />
        </FormField>
        <FormField label={t("auth.email")}>
          <input className="input" type="email" value={contacts.email} onChange={setC("email")} />
        </FormField>
      </div>
      <FormField label={t("admin.content.map")} error={err("map")}>
        <input className="input" type="url" value={contacts.map ?? ""} placeholder="https://go.2gis.com/..." onChange={setC("map")} />
      </FormField>
      <FormField label={t("admin.content.booking")} error={err("booking")}>
        <input className="input" type="url" value={contacts.booking ?? ""} placeholder="https://www.booking.com/hotel/kg/..." onChange={setC("booking")} />
      </FormField>
      {["ru", "en", "kg"].map((lang) => (
        <FormField key={lang} label={`${t("contacts.address")} (${lang.toUpperCase()})`}>
          <input className="input" value={contacts.address?.[lang] ?? ""} maxLength={200} onChange={setAddress(lang)} />
        </FormField>
      ))}

      <h2>{t("admin.content.stay")}</h2>
      <div className="form-row">
        <FormField label={t("booking.checkIn")} error={err("checkIn")}>
          <input className="input" type="time" value={stay.checkIn} onChange={setS("checkIn")} />
        </FormField>
        <FormField label={t("booking.checkOut")} error={err("checkOut")}>
          <input className="input" type="time" value={stay.checkOut} onChange={setS("checkOut")} />
        </FormField>
      </div>
      <div className="form-row">
        <FormField label={t("pricing.extraGuest")} error={err("extraGuest")}>
          <input className="input" type="number" min="0" step="100" value={stay.extraGuest} onChange={setS("extraGuest")} />
        </FormField>
        <FormField label={t("pricing.dayUse")} error={err("dayUse")}>
          <input className="input" type="number" min="0" step="100" value={stay.dayUse} onChange={setS("dayUse")} />
        </FormField>
      </div>
      <button className="btn btn--primary" type="submit" disabled={saving}>
        {saving ? t("admin.form.saving") : t("common.save")}
      </button>
    </form>
  );
}
