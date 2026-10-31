import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../hooks/useData";
import { useToast } from "../../hooks/useToast";
import useAsync from "../../hooks/useAsync";
import { listBookings, updateBookingStatus, deleteBooking } from "../../services/bookingsService";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatSom } from "../../utils/format";
import errorText from "../../utils/errorText";

const STATUSES = ["pending", "confirmed", "paid", "cancelled"];

export default function AdminBookings() {
  const { t } = useTranslation();
  const { cottages } = useData();
  const { push } = useToast();
  const { data, loading, error, reload, setData } = useAsync(listBookings);
  const [busyId, setBusyId] = useState(null);

  const run = async (id, action, successKey) => {
    setBusyId(id);
    try {
      await action();
      push(t(successKey));
    } catch (e) {
      push(errorText(e), "error");
    } finally {
      setBusyId(null);
    }
  };

  const changeStatus = (booking, status) =>
    run(booking.id, async () => {
      const updated = await updateBookingStatus(booking.id, status);
      setData((items) => items.map((b) => (b.id === booking.id ? updated : b)));
    }, "admin.saved");

  const remove = (booking) => {
    if (!window.confirm(t("common.confirmDelete", { name: `#${booking.id} ${booking.guestName}` }))) return;
    run(booking.id, async () => {
      await deleteBooking(booking.id);
      setData((items) => items.filter((b) => b.id !== booking.id));
    }, "admin.deleted");
  };

  return (
    <div className="stack">
      <h1>{t("admin.bookings")}</h1>
      {loading && <Spinner />}
      {error && <ErrorMessage message={errorText(error)} onRetry={reload} />}
      {data && !data.length && <EmptyState text={t("booking.emptyAdmin")} />}
      {data?.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("booking.cottage")}</th>
                <th>{t("booking.name")}</th>
                <th>{t("booking.checkIn")} — {t("booking.checkOut")}</th>
                <th>{t("common.total")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{cottages.find((c) => c.id === b.cottageId)?.name ?? t("booking.deletedCottage")}</td>
                  <td>
                    {b.guestName}
                    <br />
                    <span className="muted">{b.email}{b.phone && ` · ${b.phone}`}</span>
                    {b.notes && <><br /><span className="muted table__wrap">{b.notes}</span></>}
                  </td>
                  <td>{b.checkIn} — {b.checkOut}<br /><span className="muted">{t("booking.guests")}: {b.guests}</span></td>
                  <td>{formatSom(b.total)}</td>
                  <td>
                    <StatusBadge status={b.status} />
                    <select
                      className="input input--sm"
                      aria-label={t("common.status")}
                      value={b.status}
                      disabled={busyId === b.id}
                      onChange={(e) => changeStatus(b, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{t(`booking.status.${s}`)}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button type="button" className="btn btn--sm btn--danger" disabled={busyId === b.id} onClick={() => remove(b)}>
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
