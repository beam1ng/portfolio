import { Link, NavLink } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useIsAdmin } from '../../auth/useAuth';
import { isStatic } from '../../lib/apiClient';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects', end: false },
  { to: '/skills', label: 'Skills', end: false },
  { to: '/resume', label: 'Résumé', end: false },
  { to: '/contact', label: 'Contact', end: false },
] as const;

export function SiteHeader() {
  const isAdmin = useIsAdmin();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink to="/" className="brand" aria-label="Home">
          <span className="brand__dot" aria-hidden="true" />
          jakub.dev
        </NavLink>

        <nav className="nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav__link">
              {item.label}
            </NavLink>
          ))}
          <ThemeToggle />
          {/* Admin affordances only exist in the full build; the static deploy
              ships no admin surface, so there is nothing to link to. */}
          {!isStatic &&
            (isAdmin ? (
              <span className="nav__admin">
                <span className="nav__admin-badge" title="You are signed in as admin">
                  Admin mode
                </span>
                <Link to="/admin" className="nav__link nav__admin-panel">
                  Panel
                </Link>
              </span>
            ) : (
              <Link to="/admin/login" className="nav__admin-link" title="Admin login">
                Admin
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
