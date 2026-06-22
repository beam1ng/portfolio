import { Link } from 'react-router-dom';
import { useProfile } from '../../api/queries';
import {
  useAdminEducation,
  useAdminExperience,
  useAdminProjects,
  useAdminSkills,
  useAdminTechnologies,
} from '../../admin/queries';
import './admin.css';

interface ProjectRef {
  id: string;
  title: string;
}

interface Issue {
  id: string;
  label: string;
  /** Specific projects to fix, rendered as quick-edit chips. */
  items?: ProjectRef[];
  /** Fallback link when there are no per-item targets. */
  to?: string;
}

export function AdminDashboard() {
  const projects = useAdminProjects();
  const technologies = useAdminTechnologies();
  const skills = useAdminSkills();
  const experience = useAdminExperience();
  const education = useAdminEducation();
  const profile = useProfile();

  const projectList = projects.data ?? [];
  const skillCount = (skills.data ?? []).reduce((sum, c) => sum + c.skills.length, 0);
  const featuredCount = projectList.filter((p) => p.isFeatured).length;

  const stats = [
    { label: 'Projects', value: projects.data?.length, to: '/admin/projects' },
    { label: 'Featured', value: projects.data ? featuredCount : undefined, to: '/admin/projects' },
    { label: 'Technologies', value: technologies.data?.length, to: '/admin/technologies' },
    { label: 'Skills', value: skills.data ? skillCount : undefined, to: '/admin/skills' },
    { label: 'Experience', value: experience.data?.length, to: '/admin/experience' },
    { label: 'Education', value: education.data?.length, to: '/admin/education' },
  ];

  // Content-health checks derived from data already loaded for the stat cards.
  const issues: Issue[] = [];
  const toRef = (p: { id: string; title: string }): ProjectRef => ({ id: p.id, title: p.title });

  const withoutCover = projectList.filter((p) => !p.imageUrl);
  if (withoutCover.length > 0) {
    issues.push({
      id: 'cover',
      label: `${pluralize(withoutCover.length, 'project has', 'projects have')} no cover image`,
      items: withoutCover.map(toRef),
    });
  }

  const withoutLinks = projectList.filter((p) => !p.liveUrl && !p.repoUrl);
  if (withoutLinks.length > 0) {
    issues.push({
      id: 'links',
      label: `${pluralize(withoutLinks.length, 'project has', 'projects have')} no live or repo link`,
      items: withoutLinks.map(toRef),
    });
  }

  if (projects.data && featuredCount === 0) {
    issues.push({ id: 'featured', label: 'No projects are featured on the home page', to: '/admin/projects' });
  }
  if (profile.data && !profile.data.avatarUrl) {
    issues.push({ id: 'avatar', label: 'No profile avatar set (home hero shows text only)', to: '/admin/profile' });
  }
  if (profile.data && !profile.data.resumeUrl) {
    issues.push({ id: 'resume', label: 'No résumé / CV link set', to: '/admin/profile' });
  }
  if (experience.data && experience.data.length === 0) {
    issues.push({ id: 'experience', label: 'No experience entries yet', to: '/admin/experience' });
  }
  if (education.data && education.data.length === 0) {
    issues.push({ id: 'education', label: 'No education entries yet', to: '/admin/education' });
  }

  const profileChecks = profile.data
    ? [
        { label: 'Avatar', ok: Boolean(profile.data.avatarUrl) },
        { label: 'Résumé / CV', ok: Boolean(profile.data.resumeUrl) },
        { label: 'GitHub', ok: Boolean(profile.data.gitHubUrl) },
        { label: 'LinkedIn', ok: Boolean(profile.data.linkedInUrl) },
        { label: 'Location', ok: Boolean(profile.data.location) },
      ]
    : [];

  return (
    <>
      <div className="admin__header">
        <div>
          <span className="eyebrow">Overview</span>
          <h1 className="section-title">Dashboard</h1>
        </div>
        <Link to="/" className="btn btn--ghost btn--sm">View site ↗</Link>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="stat-card">
            <span className="stat-card__value">{stat.value ?? '—'}</span>
            <span className="stat-card__label">{stat.label}</span>
          </Link>
        ))}
      </div>

      <div className="dash-grid">
        <section className="panel">
          <h2 className="panel__title">Needs attention</h2>
          {issues.length === 0 ? (
            <p className="muted">Everything looks complete. Nice. ✓</p>
          ) : (
            <ul className="issue-list">
              {issues.map((issue) => (
                <li key={issue.id} className="issue">
                  <span className="issue__dot" aria-hidden="true" />
                  <div className="issue__body">
                    <span>{issue.label}</span>
                    {issue.items && (
                      <div className="issue__links">
                        {issue.items.map((item) => (
                          <Link key={item.id} to={`/admin/projects/${item.id}`} className="chip chip--sm">
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    )}
                    {issue.to && !issue.items && (
                      <Link to={issue.to} className="text-link">Fix →</Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2 className="panel__title">Profile</h2>
          {profile.data ? (
            <>
              <p className="panel__lead">{profile.data.fullName}</p>
              <p className="muted">{profile.data.headline}</p>
              <ul className="check-list">
                {profileChecks.map((check) => (
                  <li key={check.label} className={`check ${check.ok ? 'check--on' : 'check--off'}`}>
                    <span aria-hidden="true">{check.ok ? '✓' : '○'}</span>
                    {check.label}
                  </li>
                ))}
              </ul>
              <Link to="/admin/profile" className="text-link">Edit profile →</Link>
            </>
          ) : (
            <p className="muted">Loading…</p>
          )}
        </section>
      </div>
    </>
  );
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
