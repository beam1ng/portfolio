import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import './pages.css';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <section className="container notfound">
      <span className="eyebrow">404</span>
      <h1 className="display" style={{ fontSize: 'var(--text-hero)' }}>
        Lost the thread.
      </h1>
      <p className="lead">That page doesn’t exist — or moved.</p>
      <Link to="/" className="btn btn--primary">
        Back home
      </Link>
    </section>
  );
}
