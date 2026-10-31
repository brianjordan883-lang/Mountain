import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import useAsync from "../hooks/useAsync";
import DataState from "../components/ui/DataState";
import FormField from "../components/ui/FormField";
import WhatsAppButton from "../components/WhatsAppButton";
import { createBooking, getBusyRanges } from "../services/bookingsService";
import { calcTotal, countNights, isAvailable, todayIso, validateDates } from "../utils/booking";
import { formatSom } from "../utils/format";
import { bookingDetails, buildBookingMessage } from "../services/whatsappService";
import errorText from "../utils/errorText";

function BookingForm() {
  const { t } = useTranslation();
  const { cottages, settings } = useData();
  const { user } = useAuth();
  const { push } = useToast();
  const [params] = useSearchParams();
  const [form, setForm] = useState(() => ({
    cottage: params.get("cottage") || cottages[0]?.slug || "",
    guestName: user?.name || "",
    email: user?.email || "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
    notes: "",
  }));
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  const selected = useMemo(() => cottages.find((c) => c.slug === form.cottage) || cottages[0], [cottages, form.cottage]);
  const loadBusy = useCallback(() => (selected ? getBusyRanges(selected.id) : Promise.resolve([])), [selected]);
  const busy = useAsync(loadBusy);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setError("");
  };

  const nights = countNights(form.checkIn, form.checkOut);
  const total = calcTotal(selected, form.checkIn, form.checkOut, Number(form.guests), settings.stay.extraGuest);
  const dateError = form.checkIn && form.checkOut ? validateDates(form.checkIn, form.checkOut) : null;
  const taken = !dateError && nights > 0 && busy.data && !isAvailable(busy.data, form.checkIn, form.checkOut);

  const submit = async (event) => {
    event.preventDefault();
    if (sending || !selected) return;
    const problem = validateDates(form.checkIn, form.checkOut) || (taken ? "busy" : null);
    if (problem) return setError(t(`booking.errors.${problem}`));
    if (Number(form.guests) > selected.capacity) return setError(t("booking.errors.guests", { count: selected.capacity }));

    setSending(true);
    setError("");
    try {
      const booking = await createBooking({ ...form, cottageId: selected.id }, { canRead: Boolean(user) });
      setDone({
        id: booking?.id,
        total: booking?.total ?? total,
        name: selected.name,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        nights,
        guests: Number(form.guests),
        guestName: form.guestName.trim(),
        phone: form.phone.trim(),
      });
      push(t("booking.success"));
      busy.reload();
    } catch (err) {
      setError(err.code === "busy" ? t("booking.errors.busy") : errorText(err));
    } finally {
      setSending(false);
    }
  };

  if (done)
    return (
      <div className="form-card center" role="status">
        <h2>{t("booking.doneTitle")}</h2>
        <p>{t("booking.doneHint")}</p>
        {/* те же строки, что уйдут администратору в WhatsApp */}
        <dl className="booking-details">
          {bookingDetails(done).map((row) => (
            <div key={row.key} className={`booking-details__row booking-details__row--${row.key}`}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <WhatsAppButton cottage={done.name} message={buildBookingMessage(done)} label={t("booking.confirmWhatsApp")} />
        {user && <Link to="/my-bookings" className="btn btn--ghost">{t("nav.myBookings")}</Link>}
      </div>
    );

  return (
    <div className="booking-layout">
      <form className="form-card" onSubmit={submit}>
        <FormField label={t("booking.cottage")}>
          <select className="input" value={selected?.slug ?? ""} onChange={update("cottage")} disabled={sending}>
            {cottages.map((cottage) => (
              <option key={cottage.id} value={cottage.slug}>{cottage.name}</option>
            ))}
          </select>
        </FormField>
        <FormField label={t("booking.name")}>
          <input className="input" value={form.guestName} onChange={update("guestName")} required minLength={2} maxLength={80} disabled={sending} autoComplete="name" />
        </FormField>
        <div className="form-row">
          <FormField label={t("booking.email")}>
            <input className="input" type="email" value={form.email} onChange={update("email")} required disabled={sending} autoComplete="email" />
          </FormField>
          <FormField label={t("booking.phone")}>
            <input className="input" type="tel" value={form.phone} onChange={update("phone")} maxLength={30} disabled={sending} autoComplete="tel" />
          </FormField>
        </div>
        <div className="form-row">
          <FormField label={t("booking.checkIn")}>
            <input className="input" type="date" min={todayIso()} value={form.checkIn} onChange={update("checkIn")} required disabled={sending} />
          </FormField>
          <FormField label={t("booking.checkOut")}>
            <input className="input" type="date" min={form.checkIn || todayIso()} value={form.checkOut} onChange={update("checkOut")} required disabled={sending} />
          </FormField>
        </div>
        {dateError && <p className="field__error">{t(`booking.errors.${dateError}`)}</p>}
        {taken && <p className="field__error">{t("booking.errors.busy")}</p>}
        <FormField label={t("booking.guests")}>
          <input className="input" type="number" min="1" max={selected?.capacity ?? 3} value={form.guests} onChange={update("guests")} required disabled={sending} />
        </FormField>
        <FormField label={t("booking.notes")}>
          <textarea className="input" rows="3" maxLength={1000} value={form.notes} onChange={update("notes")} disabled={sending} />
        </FormField>
        {error && <p className="field__error" role="alert">{error}</p>}
        <button className="btn btn--primary" type="submit" disabled={sending || Boolean(dateError) || taken}>
          {sending ? t("common.loading") : t("booking.submit")}
        </button>
      </form>

      {selected && (
        <aside className="summary">
          <h3>{t("booking.summary")}</h3>
          {selected.images[0] && <img src={selected.images[0]} alt={selected.name} className="summary__img" />}
          <dl>
            <dt>{t("booking.cottage")}</dt>
            <dd>{selected.name}</dd>
            <dt>{t("booking.nights")}</dt>
            <dd>{nights || "—"}</dd>
            <dt>{t("booking.guests")}</dt>
            <dd>{form.guests}</dd>
          </dl>
          <p className="summary__total">
            {t("common.total")}: <b>{total ? formatSom(total) : "—"}</b>
          </p>
          <p className="muted">{t("booking.priceNote")}</p>
          {busy.data?.length > 0 && (
            <>
              <p className="muted">{t("booking.busyDates")}</p>
              <ul className="muted busy-list">
                {busy.data.map((b) => (
                  <li key={`${b.checkIn}-${b.checkOut}`}>{b.checkIn} — {b.checkOut}</li>
                ))}
              </ul>
            </>
          )}
        </aside>
      )}
    </div>
  );
}

export default function BookingPage() {
  const { t } = useTranslation();
  return (
    <section className="section page">
      <div className="container">
        <h1>{t("booking.title")}</h1>
        <DataState>
          <BookingForm />
        </DataState>
      </div>
    </section>
  );
}
