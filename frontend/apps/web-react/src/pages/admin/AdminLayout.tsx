import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../auth/useAuth';
import './admin.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/projects', label: 'Projects', end: false },
  { to: '/admin/technologies', label: 'Technologies', end: false },
  { to: '/admin/skills', label: 'Skills', end: false },
  { to: '/admin/profile', label: 'Profile', end: false },
] as const;

export function AdminLayout() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const onLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/admin/login', { replace: true }) });
  };

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">portfolio/admin</div>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="admin__navlink">
            {item.label}
          </NavLink>
        ))}
        <div className="admin__spacer" />
        <NavLink to="/" className="admin__navlink">↗ View site</NavLink>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onLogout} disabled={logout.isPending}>
          {logout.isPending ? 'Signing out…' : 'Sign out'}
        </button>
        {user && <span className="admin__userline">{user.email}</span>}
      </aside>

      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}
