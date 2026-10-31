import { useCallback, useEffect, useState } from "react";

// Загружает данные функцией fn и хранит состояние: loading / ready / error.
// fn должна быть стабильной (обёрнута в useCallback или объявлена вне компонента).
export default function useAsync(fn) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [key, setKey] = useState(0);

  useEffect(() => {
    let active = true;
    fn()
      .then((data) => active && setState({ status: "ready", data, error: null }))
      .catch((error) => active && setState({ status: "error", data: null, error }));
    return () => {
      active = false;
    };
  }, [fn, key]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, status: "loading", error: null }));
    setKey((k) => k + 1);
  }, []);

  // Обновить данные локально после успешной операции (без повторного запроса).
  const setData = useCallback((update) => setState((s) => ({ ...s, data: update(s.data) })), []);

  return { ...state, loading: state.status === "loading", reload, setData };
}
