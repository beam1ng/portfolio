import { Link } from 'react-router-dom';
import { proficiencyLabel } from '../../lib/format';
import { iconForName } from '../../lib/techIcons';
import type { ProjectRef } from '../../lib/crossref';
import './skill-meter.css';

const MAX_LEVEL = 5;

interface SkillMeterProps {
  name: string;
  /** Proficiency on a 1–5 scale. */
  level: number;
  /** Technology slug, so the name links to the filtered projects view. */
  techSlug: string;
  iconUrl?: string | null;
  /** Projects that use this technology, with their usage notes. */
  usedIn?: readonly ProjectRef[];
  /** Position in the list, used to stagger the entrance animation. */
  index?: number;
}

const STAGGER_MS = 35;
const STAGGER_CAP = 12;

export function SkillMeter({ name, level, techSlug, iconUrl, usedIn = [], index = 0 }: SkillMeterProps) {
  const pct = Math.min(Math.max(level, 0), MAX_LEVEL) / MAX_LEVEL;
  const icon = iconUrl ?? iconForName(name);

  return (
    <li
      className="skill-meter"
      style={{ animationDelay: `${Math.min(index, STAGGER_CAP) * STAGGER_MS}ms` }}
    >
      <div className="skill-meter__head">
        <span className="skill-meter__name">
          {icon && (
            <img className="skill-meter__icon" src={icon} alt="" loading="lazy" width={16} height={16} />
          )}
          <Link
            to={`/projects?tech=${techSlug}`}
            className="skill-meter__namelink"
            title={`Projects using ${name}`}
          >
            {name}
          </Link>
        </span>
        <span className="muted skill-meter__level">{proficiencyLabel(level)}</span>
      </div>
      <div
        className="skill-meter__track"
        role="meter"
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={MAX_LEVEL}
        aria-label={name}
      >
        <span className="skill-meter__fill" style={{ transform: `scaleX(${pct})` }} />
      </div>

      {usedIn.length > 0 && (
        <ul className="skill-meter__used">
          {usedIn.map((project) => (
            <li key={project.slug}>
              <Link to={`/projects/${project.slug}`} className="text-link">
                {project.title}
              </Link>
              {project.note && <span className="muted"> — {project.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
