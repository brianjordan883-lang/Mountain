import { useTranslation } from "react-i18next";
import { pickLang } from "../utils/format";

// Тексты домика на текущем языке. Описание и слоган берутся из базы (их меняет админ),
// а если там пусто — из файлов переводов, как было в исходном проекте.
export default function useCottageText() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  return (c) => ({
    tier: t(`cottages.${c.slug}.tier`, { defaultValue: t(`tiers.${c.tier}`) }),
    tagline: pickLang(c.tagline, lang) || t(`cottages.${c.slug}.tagline`, { defaultValue: "" }),
    description: pickLang(c.description, lang) || t(`cottages.${c.slug}.description`, { defaultValue: "" }),
  });
}
