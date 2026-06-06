import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../auth/useAuth';
import { LoadingState } from '../ui/States';

/** Gate for admin routes: shows a loader, then either the content or a redirect to login. */
export function RequireAuth() {
  const { data: user, isPending, isError } = useCurrentUser();
  const location = useLocation();

  if (isPending) {
    return <LoadingState label="Checking session…" />;
  }

  if (isError || !user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
