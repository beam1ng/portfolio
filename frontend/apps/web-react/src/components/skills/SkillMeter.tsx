import { Link } from 'react-router-dom';
import type { Skill } from '@portfolio/api-client';
import { proficiencyLabel } from '../../lib/format';
import { iconForName } from '../../lib/techIcons';
import type { ProjectRef } from '../../lib/crossref';
import './skill-meter.css';

const MAX_LEVEL = 5;

interface SkillMeterProps {
  skill: Skill;
  /** Projects that use this skill (matched by technology name). */
  usedIn?: readonly ProjectRef[];
  /** Slug of the matching technology, so the name links to the filtered projects view. */
  techSlug?: string | null;
}

export function SkillMeter({ skill, usedIn = [], techSlug = null }: SkillMeterProps) {
  const pct = Math.min(Math.max(skill.level, 0), MAX_LEVEL) / MAX_LEVEL;
  const iconUrl = iconForName(skill.name);

  return (
    <li className="skill-meter">
      <div className="skill-meter__head">
        <span className="skill-meter__name">
          {iconUrl && (
            <img className="skill-meter__icon" src={iconUrl} alt="" loading="lazy" width={16} height={16} />
          )}
          {techSlug ? (
            <Link
              to={`/projects?tech=${techSlug}`}
              className="skill-meter__namelink"
              title={`Projects using ${skill.name}`}
            >
              {skill.name}
            </Link>
          ) : (
            skill.name
          )}
        </span>
        <span className="muted skill-meter__level">{proficiencyLabel(skill.level)}</span>
      </div>
      <div
        className="skill-meter__track"
        role="meter"
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={MAX_LEVEL}
        aria-label={skill.name}
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
