import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../ui/Spinner";

// Скрывает страницу от гостей и не-админов. Это удобство интерфейса:
// настоящая защита данных — политики RLS в базе (supabase/schema.sql).
export default function PrivateRoute({ role, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <Spinner />; // пока Supabase проверяет сохранённую сессию
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to="/forbidden" replace />;
  return children;
}
