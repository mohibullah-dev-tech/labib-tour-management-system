import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthLoadingScreen } from '@/features/auth/components/AuthLoadingScreen';
import { AUTH_ROUTES } from '@/features/auth/constants/auth-routes';

/**
 * Wraps any route branch that requires SOME authenticated user,
 * regardless of role — /dashboard, /profile, /bookings, and the parent
 * of /host and /admin (which add <RoleGuard> on top of this for their
 * stricter requirement). Unauthenticated visitors are sent to /login
 * with the page they wanted attached to router state, so login can
 * send them back after success.
 *
 * SECURITY NOTE: this check runs entirely in the browser and can be
 * bypassed by anyone with devtools — it exists purely so the UI never
 * *shows* a page a visitor shouldn't see. The backend must independently
 * reject any unauthorized request regardless of what this component
 * does; never treat this guard as the real access-control boundary.
 */
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.login} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export { ProtectedRoute };
