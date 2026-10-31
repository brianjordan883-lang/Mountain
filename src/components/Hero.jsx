import { useTranslation } from "react-i18next";
import WhatsAppButton from "./WhatsAppButton";
import styles from "./Hero.module.css";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1>Calma Mountain</h1>
        <p className={styles.tag}>{t("hero.tag")}</p>
        <p>{t("hero.text")}</p>
        <div className={styles.actions}>
          <WhatsAppButton />
        </div>
      </div>

      <div className={styles.photo}>
        <img src="/images/hero-mountains.webp" alt="Calma Mountain" fetchPriority="high" />
      </div>
    </section>
  );
}
