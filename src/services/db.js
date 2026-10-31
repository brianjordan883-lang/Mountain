import { supabase } from "../lib/supabase";

// Ошибка приложения с понятным кодом. Текст для пользователя берётся из переводов
// по ключу errors.codes.<code> (см. utils/errorText.js).
export class AppError extends Error {
  constructor(code, cause) {
    super(cause?.message || code);
    this.code = code;
    this.cause = cause;
  }
}

export const SESSION_EXPIRED_EVENT = "calma:session-expired";

export function db() {
  if (!supabase) throw new AppError("not_configured");
  return supabase;
}

export function toAppError(error) {
  if (error instanceof AppError) return error;
  const code = String(error?.code ?? "");
  const message = String(error?.message ?? "");

  if (code === "PGRST301" || code === "PGRST303" || /jwt expired/i.test(message)) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    return new AppError("session_expired", error);
  }
  if (code === "42501" || /row-level security|permission denied/i.test(message)) return new AppError("forbidden", error);
  if (code === "23505") return new AppError("duplicate", error);
  if (code === "23P01") return new AppError("busy", error);
  if (code === "23514" || code === "22P02" || code === "23502") return new AppError("invalid", error);
  // Ограничение частоты из supabase/security.sql (защита от ботов и спама).
  if (/rate_limit/i.test(message)) return new AppError("rate_limit", error);
  if (/maximum allowed size|too large/i.test(message)) return new AppError("file_size", error);
  if (/mime type/i.test(message)) return new AppError("file_type", error);
  if (/failed to fetch|network/i.test(message)) return new AppError("network", error);
  console.error("Supabase error:", error);
  return new AppError("unknown", error);
}

// Разворачивает ответ Supabase { data, error }: возвращает data или бросает AppError.
export function unwrap({ data, error }) {
  if (error) throw toAppError(error);
  return data;
}
