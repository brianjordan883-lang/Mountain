import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import { useToast } from "../hooks/useToast";
import useAsync from "../hooks/useAsync";
import { listBookings, updateBookingStatus } from "../services/bookingsService";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/ui/Spinner";
import StatusBadge from "../components/ui/StatusBadge";
import { formatSom } from "../utils/format";
import errorText from "../utils/errorText";

// RLS возвращает пользователю только его собственные брони.
export default function MyBookings() {
  const { t } = useTranslation();
  const { cottages } = useData();
  const { push } = useToast();
  const { data, loading, error, reload, setData } = useAsync(listBookings);
  const [busyId, setBusyId] = useState(null);

  const cancel = async (booking) => {
    if (!window.confirm(t("booking.cancelConfirm"))) return;
    setBusyId(booking.id);
    try {
      const updated = await updateBookingStatus(booking.id, "cancelled");
      setData((items) => items.map((b) => (b.id === booking.id ? updated : b)));
      push(t("booking.cancelled"));
    } catch (e) {
      push(errorText(e), "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="section page">
      <div className="container">
        <h1>{t("booking.myTitle")}</h1>
        {loading && <Spinner />}
        {error && <ErrorMessage message={errorText(error)} onRetry={reload} />}
        {data && !data.length && (
          <div className="state empty">
            <p>{t("booking.empty")}</p>
            <Link className="btn btn--primary" to="/cottages">{t("nav.cottages")}</Link>
          </div>
        )}
        {data?.length > 0 && (
          <div className="booking-list">
            {data.map((booking) => (
              <article className="booking-card" key={booking.id}>
                <div>
                  <h3>#{booking.id} · {cottages.find((c) => c.id === booking.cottageId)?.name ?? t("booking.deletedCottage")}</h3>
                  <p>{booking.checkIn} — {booking.checkOut} · {t("booking.guests")}: {booking.guests}</p>
                  <p className="muted">{booking.guestName} · {booking.email}</p>
                </div>
                <div className="booking-card__side">
                  <StatusBadge status={booking.status} />
                  <b>{formatSom(booking.total)}</b>
                  {booking.status === "pending" && (
                    <button type="button" className="link-btn link-btn--danger" disabled={busyId === booking.id} onClick={() => cancel(booking)}>
                      {t("booking.cancel")}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
