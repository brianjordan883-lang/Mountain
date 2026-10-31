import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import Hero from "../components/Hero";
import CottageCard from "../components/CottageCard";
import Concept from "../components/Concept";
import Pricing from "../components/Pricing";
import Reviews from "../components/Reviews";
import InstagramBlock from "../components/InstagramBlock";
import DataState from "../components/ui/DataState";
import EmptyState from "../components/ui/EmptyState";

export default function Home() {
  const { t } = useTranslation();
  const { cottages } = useData();

  return (
    <>
      <Hero />
      <Concept />

      <section className="section" id="cottages">
        <div className="container">
          <h2>{t("cottages.sectionTitle")}</h2>
          <DataState skeleton="cottages" count={4}>
            {cottages.length ? (
              <div className="grid">
                {cottages.map((c) => (
                  <CottageCard key={c.id} cottage={c} />
                ))}
              </div>
            ) : (
              <EmptyState text={t("common.noCottages")} />
            )}
          </DataState>
        </div>
      </section>

      <Pricing />
      <Reviews />
      <InstagramBlock />
    </>
  );
}
