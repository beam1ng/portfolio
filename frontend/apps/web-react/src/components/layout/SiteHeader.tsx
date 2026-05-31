import { NavLink } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects', end: false },
  { to: '/skills', label: 'Skills', end: false },
  { to: '/contact', label: 'Contact', end: false },
] as const;

export function SiteHeader() {
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
        </nav>
      </div>
    </header>
  );
}
