import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import useCottageText from "../hooks/useCottageText";
import WhatsAppButton from "./WhatsAppButton";
import DataState from "./ui/DataState";
import { formatSom } from "../utils/format";

export default function Pricing() {
  const { t } = useTranslation();
  const { cottages, settings } = useData();
  const text = useCottageText();
  const { stay } = settings;
  const list = t("pricing.included", { returnObjects: true });
  const included = Array.isArray(list) ? list : [];

  return (
    <section className="section dark" id="pricing">
      <div className="container">
        <h2>{t("pricing.title")}</h2>
        <hr className="rule" />
        <DataState>
          <div className="menu">
            {cottages.map((c) => {
              const { tier, tagline } = text(c);
              return (
                <div className="menu__row" key={c.id}>
                  <div>
                    <div className="menu__name">
                      {c.name} — <em>{tier}</em>
                    </div>
                    <div className="menu__sub">{tagline}</div>
                  </div>
                  <div className="menu__price">
                    <span>
                      {t("cottage.weekday")} — <b>{formatSom(c.price.weekday)}</b>
                    </span>
                    <span>
                      {t("cottage.weekend")} — <b>{formatSom(c.price.weekend)}</b>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="box">
            {t("pricing.dayUse")} — <b>{formatSom(stay.dayUse)}</b>
            <div className="menu__sub">{t("pricing.dayUseNote")}</div>
          </div>

          <h2>{t("pricing.includedTitle")}</h2>
          <hr className="rule" />
          <ul className="incl">
            {included.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <p className="menu__sub">
            {t("pricing.extraGuest")}: +{formatSom(stay.extraGuest)}
          </p>
          <p className="menu__sub">
            {t("pricing.times", { in: stay.checkIn, out: stay.checkOut })}
          </p>
        </DataState>
        <WhatsAppButton />
      </div>
    </section>
  );
}
