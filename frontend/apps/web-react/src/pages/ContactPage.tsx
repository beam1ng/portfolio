import { useProfile } from '../api/queries';
import { ErrorState, LoadingState } from '../components/ui/States';
import './pages.css';

interface ContactLink {
  label: string;
  value: string;
  href: string;
}

function buildLinks(profile: {
  email: string | null;
  gitHubUrl: string | null;
  linkedInUrl: string | null;
  websiteUrl: string | null;
}): ContactLink[] {
  const links: ContactLink[] = [];
  if (profile.email) {
    links.push({ label: 'Email', value: profile.email, href: `mailto:${profile.email}` });
  }
  if (profile.gitHubUrl) {
    links.push({ label: 'GitHub', value: strip(profile.gitHubUrl), href: profile.gitHubUrl });
  }
  if (profile.linkedInUrl) {
    links.push({ label: 'LinkedIn', value: strip(profile.linkedInUrl), href: profile.linkedInUrl });
  }
  if (profile.websiteUrl) {
    links.push({ label: 'Website', value: strip(profile.websiteUrl), href: profile.websiteUrl });
  }
  return links;
}

function strip(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function ContactPage() {
  const query = useProfile();

  if (query.isPending) {
    return <LoadingState label="Loading…" />;
  }
  if (query.isError) {
    return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;
  }

  const links = buildLinks(query.data);

  return (
    <section className="container section">
      <div className="contact reveal">
        <div>
          <span className="eyebrow">Say hello</span>
          <h1 className="display" style={{ fontSize: 'var(--text-hero)' }}>
            Let’s talk.
          </h1>
          <p className="lead" style={{ marginTop: 'var(--space-4)' }}>
            Open to interesting projects and collaboration. The fastest way to reach me is below.
          </p>
        </div>

        <div className="contact__links">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="contact__link"
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer noopener"
            >
              <span className="muted">{link.label}</span>
              <span className="text-link">{link.value}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
