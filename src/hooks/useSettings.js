import { useData } from "./useData";

// Контакты и условия проживания из базы (с запасными значениями по умолчанию).
export const useSettings = () => useData().settings;
