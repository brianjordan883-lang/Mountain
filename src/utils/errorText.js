import i18n from "../i18n";

// Превращает любую ошибку в понятный пользователю текст на текущем языке.
export default function errorText(error) {
  const code = error?.code && i18n.exists(`errors.codes.${error.code}`) ? error.code : "unknown";
  return i18n.t(`errors.codes.${code}`);
}
