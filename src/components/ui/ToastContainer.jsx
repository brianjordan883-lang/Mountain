import { useToast } from "../../hooks/useToast";

export default function ToastContainer() {
  const { toasts } = useToast();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
