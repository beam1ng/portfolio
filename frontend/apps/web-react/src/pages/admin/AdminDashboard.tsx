import { Link } from 'react-router-dom';
import { useAdminProjects, useAdminSkills, useAdminTechnologies } from '../../admin/queries';
import './admin.css';

export function AdminDashboard() {
  const projects = useAdminProjects();
  const technologies = useAdminTechnologies();
  const skills = useAdminSkills();

  const skillCount = (skills.data ?? []).reduce((sum, c) => sum + c.skills.length, 0);

  const cards = [
    { label: 'Projects', count: projects.data?.length, to: '/admin/projects' },
    { label: 'Technologies', count: technologies.data?.length, to: '/admin/technologies' },
    { label: 'Skills', count: skills.data ? skillCount : undefined, to: '/admin/skills' },
  ];

  return (
    <>
      <div className="admin__header">
        <div>
          <span className="eyebrow">Overview</span>
          <h1 className="section-title">Dashboard</h1>
        </div>
      </div>

      <div className="project-grid">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="card" style={{ padding: 'var(--space-6)' }}>
            <span className="muted">{card.label}</span>
            <span className="display" style={{ fontSize: 'var(--text-xl)' }}>{card.count ?? '—'}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
