import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME_PATH } from '@/features/auth/constants/permissions';
import { AuthLoadingScreen } from '@/features/auth/components/AuthLoadingScreen';

/**
 * The inverse of ProtectedRoute — wraps /login, /register,
 * /forgot-password, etc. An already-authenticated visitor has no
 * reason to see a login form; they're redirected to their role's home
 * (ROLE_HOME_PATH) instead of being shown it.
 */
function GuestRoute() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;

  if (isAuthenticated && role) {
    return <Navigate to={ROLE_HOME_PATH[role]} replace />;
  }

  return <Outlet />;
}

export { GuestRoute };
