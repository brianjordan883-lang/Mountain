import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import useDebounce from "../hooks/useDebounce";
import CottageCard from "../components/CottageCard";
import SearchBar from "../components/ui/SearchBar";
import DataState from "../components/ui/DataState";
import FormField from "../components/ui/FormField";
import { TIERS } from "../data/info";

export default function CottagesPage() {
  const { t } = useTranslation();
  const { cottages } = useData();
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("");
  const search = useDebounce(query, 250);

  // Поиск — по названию домика, фильтр — по категории.
  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    return cottages.filter((c) => (!value || c.name.toLowerCase().includes(value)) && (!tier || c.tier === tier));
  }, [cottages, search, tier]);

  const reset = () => {
    setQuery("");
    setTier("");
  };
  const active = query || tier;

  return (
    <section className="section page">
      <div className="container">
        <p className="eyebrow">{t("nav.cottages")}</p>
        <h1>{t("cottages.pageTitle")}</h1>
        <div className="filters">
          <FormField label={t("common.search")}>
            <SearchBar value={query} onChange={setQuery} />
          </FormField>
          <FormField label={t("cottagesPage.tier")}>
            <select className="input" value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="">{t("cottagesPage.anyTier")}</option>
              {TIERS.map((key) => (
                <option key={key} value={key}>{t(`tiers.${key}`)}</option>
              ))}
            </select>
          </FormField>
          <button type="button" className="btn btn--ghost" onClick={reset} disabled={!active}>
            {t("cottagesPage.reset")}
          </button>
        </div>
        <DataState skeleton="cottages">
          <p className="muted">{t("cottagesPage.found", { count: filtered.length })}</p>
          {filtered.length ? (
            <div className="grid">
              {filtered.map((cottage) => (
                <CottageCard key={cottage.id} cottage={cottage} />
              ))}
            </div>
          ) : (
            <div className="state empty">
              <p>{t("cottagesPage.empty")}</p>
              {active && (
                <button type="button" className="btn btn--ghost" onClick={reset}>
                  {t("cottagesPage.reset")}
                </button>
              )}
            </div>
          )}
        </DataState>
      </div>
    </section>
  );
}
