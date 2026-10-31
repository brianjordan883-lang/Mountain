import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../hooks/useData";
import { useToast } from "../../hooks/useToast";
import useAsync from "../../hooks/useAsync";
import { listAllReviews, setReviewApproved, deleteReview, saveReviewTranslations } from "../../services/reviewsService";
import errorText from "../../utils/errorText";
import { formatDate } from "../../utils/format";
import EmptyState from "../ui/EmptyState";
import ErrorMessage from "../ErrorMessage";
import Spinner from "../ui/Spinner";
import StarRating from "../ui/StarRating";
import Modal from "../ui/Modal";

const FILTERS = ["pending", "approved", "all"];

const buildTranslationDraft = (review) => ({
  ru: { name: review.name, text: review.text || "" },
  en: { name: review.name, text: review.translations?.en?.text || "" },
  kg: { name: review.name, text: review.translations?.kg?.text || "" },
});

const buildGoogleTranslateUrl = (lang, text) => {
  const target = lang === "kg" ? "ky" : lang;
  return `https://translate.google.com/?sl=auto&tl=${target}&text=${encodeURIComponent(text)}`;
};

export default function ReviewsAdmin() {
  const { t, i18n } = useTranslation();
  const { cottages, refreshReviews } = useData();
  const { push } = useToast();
  const { data, loading, error, reload, setData } = useAsync(listAllReviews);
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [translationReview, setTranslationReview] = useState(null);
  const [translationDraft, setTranslationDraft] = useState(null);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={errorText(error)} onRetry={reload} />;

  const counts = {
    pending: data.filter((r) => !r.approved).length,
    approved: data.filter((r) => r.approved).length,
    all: data.length,
  };
  const list = data.filter((r) => filter === "all" || (filter === "approved") === r.approved);

  const run = async (id, action, successKey) => {
    setBusyId(id);
    try {
      await action();
      push(t(successKey));
      refreshReviews().catch((e) => console.error("Public reviews refresh failed:", e));
    } catch (e) {
      push(errorText(e), "error");
    } finally {
      setBusyId(null);
    }
  };

  const toggle = (review) =>
    run(
      review.id,
      async () => {
        const updated = await setReviewApproved(review.id, !review.approved);
        setData((items) => items.map((r) => (r.id === review.id ? updated : r)));
      },
      review.approved ? "admin.reviews.hidden" : "admin.reviews.approved"
    );

  const remove = (review) => {
    if (!window.confirm(t("common.confirmDelete", { name: review.name }))) return;
    run(
      review.id,
      async () => {
        await deleteReview(review.id);
        setData((items) => items.filter((r) => r.id !== review.id));
      },
      "admin.deleted"
    );
  };

  const openTranslation = (review) => {
    setTranslationReview(review);
    setTranslationDraft(buildTranslationDraft(review));
  };

  const closeTranslation = () => {
    setTranslationReview(null);
    setTranslationDraft(null);
  };

  const updateTranslationText = (lang, value) => {
    setTranslationDraft((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], text: value },
    }));
  };

  const saveTranslation = async () => {
    if (!translationReview || !translationDraft) return;
    setBusyId(translationReview.id);
    try {
      const updated = await saveReviewTranslations(translationReview.id, {
        ru: { name: translationReview.name, text: translationDraft.ru.text },
        en: { name: translationReview.name, text: translationDraft.en.text },
        kg: { name: translationReview.name, text: translationDraft.kg.text },
      });
      setData((items) => items.map((r) => (r.id === translationReview.id ? updated : r)));
      closeTranslation();
      push(t("admin.saved"));
    } catch (e) {
      push(errorText(e), "error");
    } finally {
      setBusyId(null);
    }
  };

  const openGoogle = (lang, text) => {
    const url = buildGoogleTranslateUrl(lang, text || translationReview.text || "");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="admin-tabs" role="tablist">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={`admin-tab ${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {t(`admin.reviews.filter.${key}`)} ({counts[key]})
          </button>
        ))}
      </div>

      {!list.length ? (
        <EmptyState text={t("admin.reviews.empty")} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("reviews.form.name")}</th>
                <th>{t("reviews.form.rating")}</th>
                <th>{t("reviews.form.text")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const busy = busyId === r.id;
                return (
                  <tr key={r.id}>
                    <td>
                      <b>{r.name}</b>
                      <br />
                      <span className="muted">{cottages.find((c) => c.id === r.cottageId)?.name ?? t("reviews.form.general")}</span>
                      <br />
                      <span className="muted">{formatDate(r.date, i18n.resolvedLanguage)}</span>
                    </td>
                    <td>
                      <StarRating value={r.rating} />
                    </td>
                    <td className="table__wrap">{r.text}</td>
                    <td>
                      <span className={`badge ${r.approved ? "badge--confirmed" : "badge--pending"}`}>
                        {t(r.approved ? "admin.reviews.statusApproved" : "admin.reviews.statusPending")}
                      </span>
                    </td>
                    <td>
                      <div className="table__actions">
                        <button type="button" className="btn btn--sm btn--primary" disabled={busy} onClick={() => toggle(r)}>
                          {t(r.approved ? "admin.reviews.hide" : "admin.reviews.approve")}
                        </button>
                        <button type="button" className="btn btn--sm btn--light" disabled={busy} onClick={() => openTranslation(r)}>
                          {t("admin.reviews.translation.action")}
                        </button>
                        <button type="button" className="btn btn--sm btn--danger" disabled={busy} onClick={() => remove(r)}>
                          {t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {translationReview && translationDraft && (
        <Modal title={t("admin.reviews.translation.title")} onClose={closeTranslation}>
          <div className="translation-modal">
            <label className="field">
              <span className="field__label">{t("admin.reviews.translation.ru")}</span>
              <textarea className="input translation-textarea" rows={6} value={translationDraft.ru.text} readOnly />
            </label>

            <div className="translation-grid">
              <label className="field">
                <span className="field__label">{t("admin.reviews.translation.en")}</span>
                <textarea
                  className="input translation-textarea"
                  rows={6}
                  value={translationDraft.en.text}
                  onChange={(event) => updateTranslationText("en", event.target.value)}
                />
              </label>
              <div className="translation-actions">
                <button type="button" className="btn btn--sm btn--light" onClick={() => openGoogle("en", translationDraft.en.text || translationReview.text)}>
                  {t("admin.reviews.translation.openGoogle")}
                </button>
              </div>
            </div>

            <div className="translation-grid">
              <label className="field">
                <span className="field__label">{t("admin.reviews.translation.kg")}</span>
                <textarea
                  className="input translation-textarea"
                  rows={6}
                  value={translationDraft.kg.text}
                  onChange={(event) => updateTranslationText("kg", event.target.value)}
                />
              </label>
              <div className="translation-actions">
                <button type="button" className="btn btn--sm btn--light" onClick={() => openGoogle("kg", translationDraft.kg.text || translationReview.text)}>
                  {t("admin.reviews.translation.openGoogle")}
                </button>
              </div>
            </div>

            <div className="translation-footer">
              <button type="button" className="btn btn--primary" disabled={busyId === translationReview.id} onClick={saveTranslation}>
                {t("common.save")}
              </button>
              <button type="button" className="btn btn--light" onClick={closeTranslation}>
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
