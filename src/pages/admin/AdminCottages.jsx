import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "../../hooks/useData";
import { useToast } from "../../hooks/useToast";
import DataState from "../../components/ui/DataState";
import EmptyState from "../../components/ui/EmptyState";
import CottageForm from "../../components/admin/CottageForm";
import { formatSom } from "../../utils/format";
import errorText from "../../utils/errorText";

export default function AdminCottages() {
  const { t } = useTranslation();
  const { cottages, addCottage, updateCottage, removeCottage } = useData();
  const { push } = useToast();
  const [editing, setEditing] = useState(null); // null — форма закрыта, "new" — новый домик, объект — редактирование
  const [deletingId, setDeletingId] = useState(null);

  // Ошибку сохранения CottageForm покажет сама, поэтому здесь её не перехватываем.
  const save = async (form) => {
    if (editing === "new") {
      await addCottage(form);
      push(t("admin.added"));
    } else {
      const { cleanupError } = await updateCottage(editing.id, form);
      push(t("admin.saved"));
      if (cleanupError) push(t("admin.imageCleanupError"), "error");
    }
    setEditing(null);
  };

  const remove = async (cottage) => {
    if (!window.confirm(t("admin.confirmDeleteCottage", { name: cottage.name }))) return;
    setDeletingId(cottage.id);
    try {
      const { cleanupError } = await removeCottage(cottage.id);
      push(t("admin.deleted"));
      if (cleanupError) push(t("admin.imageCleanupError"), "error");
    } catch (error) {
      push(errorText(error), "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="stack">
      <div className="section__head">
        <h1>{t("admin.cottages")}</h1>
        <button type="button" className="btn btn--primary" onClick={() => setEditing("new")}>
          + {t("admin.addCottage")}
        </button>
      </div>

      <DataState>
        {!cottages.length ? (
          <EmptyState text={t("common.noCottages")} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th aria-label={t("admin.form.image")} />
                  <th>{t("admin.form.name")}</th>
                  <th>{t("cottage.weekday")}</th>
                  <th>{t("cottage.weekend")}</th>
                  <th>{t("admin.form.capacity")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {cottages.map((c) => (
                  <tr key={c.id}>
                    <td>{c.images[0] ? <img className="table__thumb" src={c.images[0]} alt="" /> : <span className="table__thumb table__thumb--empty" />}</td>
                    <td>
                      <Link to={`/cottages/${c.slug}`}>{c.name}</Link>
                      <br />
                      <span className="muted">{t(`tiers.${c.tier}`)}</span>
                    </td>
                    <td>{formatSom(c.price.weekday)}</td>
                    <td>{formatSom(c.price.weekend)}</td>
                    <td>{c.capacity}</td>
                    <td>
                      <div className="table__actions">
                        <button type="button" className="btn btn--sm btn--ghost" onClick={() => setEditing(c)} disabled={deletingId === c.id}>
                          {t("common.edit")}
                        </button>
                        <button type="button" className="btn btn--sm btn--danger" onClick={() => remove(c)} disabled={deletingId === c.id}>
                          {deletingId === c.id ? t("common.loading") : t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataState>

      {editing && (
        <CottageForm
          key={editing === "new" ? "new" : editing.id}
          title={editing === "new" ? t("admin.addCottage") : t("admin.editCottage")}
          cottage={editing === "new" ? null : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
