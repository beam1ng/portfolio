import { useProfile } from '../../api/queries';

export function SiteFooter() {
  const { data: profile } = useProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <span>© {year} {profile?.fullName ?? 'Jakub Augustyniak'}</span>
        <div className="social-row">
          {profile?.gitHubUrl && (
            <a href={profile.gitHubUrl} target="_blank" rel="noreferrer noopener">
              GitHub
            </a>
          )}
          {profile?.linkedInUrl && (
            <a href={profile.linkedInUrl} target="_blank" rel="noreferrer noopener">
              LinkedIn
            </a>
          )}
          {profile?.email && <a href={`mailto:${profile.email}`}>Email</a>}
        </div>
      </div>
    </footer>
  );
}
