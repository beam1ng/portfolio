import type { Skill } from '@portfolio/api-client';
import { proficiencyLabel } from '../../lib/format';
import { iconForName } from '../../lib/techIcons';
import './skill-meter.css';

const MAX_LEVEL = 5;

export function SkillMeter({ skill }: { skill: Skill }) {
  const pct = Math.min(Math.max(skill.level, 0), MAX_LEVEL) / MAX_LEVEL;
  const iconUrl = iconForName(skill.name);

  return (
    <li className="skill-meter">
      <div className="skill-meter__head">
        <span className="skill-meter__name">
          {iconUrl && (
            <img className="skill-meter__icon" src={iconUrl} alt="" loading="lazy" width={16} height={16} />
          )}
          {skill.name}
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
    </li>
  );
}
