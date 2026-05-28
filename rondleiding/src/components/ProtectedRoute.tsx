import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, requiresPasswordChange } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiresPasswordChange) {
    return <Navigate to="/reset-password" replace />;
  }

  return <Outlet />;
}
