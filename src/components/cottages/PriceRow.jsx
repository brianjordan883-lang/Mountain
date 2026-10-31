import { useTranslation } from "react-i18next";
import { formatSom } from "../../utils/format";

export default function PriceRow({ price }) {
  const { t } = useTranslation();
  return (
    <div className="price">
      <span>
        {t("cottage.weekday")} <b>{formatSom(price.weekday)}</b>
      </span>
      <span>
        {t("cottage.weekend")} <b>{formatSom(price.weekend)}</b>
      </span>
    </div>
  );
}
