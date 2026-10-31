import { useTranslation } from "react-i18next";
import DataState from "../../components/ui/DataState";
import SettingsForm from "../../components/admin/SettingsForm";
import FaqAdmin from "../../components/admin/FaqAdmin";

export default function AdminContent() {
  const { t } = useTranslation();

  return (
    <div className="stack">
      <h1>{t("admin.content.title")}</h1>
      <p className="muted">{t("admin.content.hint")}</p>
      <DataState>
        <SettingsForm />
        <FaqAdmin />
      </DataState>
    </div>
  );
}
