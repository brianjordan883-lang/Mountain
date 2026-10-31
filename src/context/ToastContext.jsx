import { useCallback, useState } from "react";
import { ToastContext } from "./contexts";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ push, toasts }}>
      {children}
    </ToastContext.Provider>
  );
}
