import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';

export default function ProtectedRoute() {
  const { user, token } = useAuthStore();
  if (!token && !user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
