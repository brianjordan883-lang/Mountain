import { AppError, db, toAppError, unwrap } from "./db";

// Провайдеры OAuth включаются только если они реально настроены в Supabase
// и перечислены в .env: VITE_AUTH_PROVIDERS=google,github
export const oauthProviders = (import.meta.env.VITE_AUTH_PROVIDERS || "")
  .split(",")
  .map((p) => p.trim())
  .filter((p) => p === "google" || p === "github");

const authError = (error) => {
  const message = String(error?.message ?? "");
  if (/invalid login credentials/i.test(message)) return new AppError("invalid_credentials", error);
  if (/email not confirmed/i.test(message)) return new AppError("email_not_confirmed", error);
  if (/already registered|already been registered/i.test(message)) return new AppError("user_exists", error);
  if (error?.code === "weak_password" || /password should/i.test(message)) return new AppError("weak_password", error);
  if (/rate limit/i.test(message)) return new AppError("rate_limit", error);
  return toAppError(error);
};

export async function signIn(email, password) {
  const { data, error } = await db().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw authError(error);
  return data.session;
}

// Возвращает { needsConfirmation: true }, если в Supabase включено подтверждение email.
export async function signUp({ name, email, password }) {
  const { data, error } = await db().auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
  });
  if (error) throw authError(error);
  // Supabase не раскрывает, что email занят: возвращает пользователя без identities.
  if (data.user && data.user.identities?.length === 0) throw new AppError("user_exists");
  return { needsConfirmation: !data.session };
}

export async function signInWithOAuth(provider) {
  const { error } = await db().auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
  if (error) throw authError(error);
}

export async function signOut() {
  const { error } = await db().auth.signOut();
  if (error) throw authError(error);
}

// Роль берётся из таблицы profiles: её защищает RLS, пользователь не может сам стать админом.
export async function getProfile(userId) {
  return unwrap(await db().from("profiles").select("id, name, role").eq("id", userId).maybeSingle());
}
