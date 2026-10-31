import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import * as auth from "../services/authService";
import { SESSION_EXPIRED_EVENT } from "../services/db";
import { useToast } from "../hooks/useToast";
import { AuthContext } from "./contexts";

// Ошибка OAuth приходит в адресе после редиректа: ?error_description=... или #error_description=...
function readOAuthError() {
  const params = new URLSearchParams(window.location.search || window.location.hash.slice(1));
  return params.get("error_description");
}

export function AuthProvider({ children }) {
  const { t } = useTranslation();
  const { push } = useToast();
  // undefined — сессия ещё не проверена; null — пользователь не вошёл.
  const [session, setSession] = useState(isSupabaseConfigured ? undefined : null);
  const [profile, setProfile] = useState({ userId: null, data: null });

  // Supabase сам хранит и обновляет токен. Мы только подписываемся на изменения сессии.
  useEffect(() => {
    if (!supabase) return undefined;
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  // Роль читаем из таблицы profiles (её нельзя изменить из браузера).
  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    auth
      .getProfile(userId)
      .then((data) => active && setProfile({ userId, data }))
      .catch((error) => {
        console.error("Profile load failed:", error);
        if (active) setProfile({ userId, data: null });
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    const onExpired = () => {
      supabase?.auth.signOut({ scope: "local" });
      push(t("errors.codes.session_expired"), "error");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [push, t]);

  useEffect(() => {
    const oauthError = readOAuthError();
    if (oauthError) push(`${t("auth.errors.oauth")}: ${oauthError}`, "error");
  }, [push, t]);

  const logout = useCallback(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      // Даже если сервер недоступен, локально сессию всё равно завершаем.
      console.error("Sign out failed:", error);
      await supabase?.auth.signOut({ scope: "local" });
    }
  }, []);

  const value = useMemo(() => {
    const profileReady = !userId || profile.userId === userId;
    const data = profile.userId === userId ? profile.data : null;
    const user = session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          name: data?.name || session.user.user_metadata?.name || session.user.email,
          role: data?.role ?? "user",
        }
      : null;

    return {
      user,
      isAdmin: user?.role === "admin",
      ready: session !== undefined && profileReady,
      providers: auth.oauthProviders,
      login: (email, password) => auth.signIn(email, password),
      register: (form) => auth.signUp(form),
      oauth: (provider) => auth.signInWithOAuth(provider),
      logout,
    };
  }, [session, userId, profile, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
