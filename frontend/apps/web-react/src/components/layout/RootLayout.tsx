import { lazy, Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { LoadingState } from '../ui/States';
import { useIsAdmin } from '../../auth/useAuth';
import { DebugProvider } from '../../debug/DebugContext';

// Admin-only debug overlay; its own chunk so the public bundle stays lean.
const DebugSidebar = lazy(() => import('../../debug/DebugSidebar').then((m) => ({ default: m.DebugSidebar })));

function AdminDebugMount() {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;
  return (
    <Suspense fallback={null}>
      <DebugSidebar />
    </Suspense>
  );
}

/** App frame: header, routed page content, footer; scrolls to top on navigation. */
export function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <DebugProvider>
      <div className="shell">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </main>
        <SiteFooter />
        <AdminDebugMount />
      </div>
    </DebugProvider>
  );
}
