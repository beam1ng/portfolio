import { useMemo, useState, type ReactNode } from 'react';
import { useDebug } from './DebugContext';
import { SKILL_NAV_DEFAULTS, SKILL_NAV_SLIDERS } from './skillNavParams';
import { compileEasing } from './easing';
import { EasingPreview } from './EasingPreview';
import './debug.css';

/** Collapsible group with a toggleable header describing what it controls. */
function DebugSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="debug-section">
      <button type="button" className="debug-section__head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className={`debug-section__chevron${open ? ' is-open' : ''}`} aria-hidden="true">
          ▸
        </span>
        {title}
      </button>
      {open && <div className="debug-section__body">{children}</div>}
    </section>
  );
}

function SkillNavControls() {
  const { skillNav, setSkillNav, resetSkillNav } = useDebug();
  const compiled = useMemo(() => compileEasing(skillNav.easing), [skillNav.easing]);
  const plateauFraction = skillNav.radius > 0 ? skillNav.plateau / skillNav.radius : 0;

  return (
    <>
      {SKILL_NAV_SLIDERS.map((spec) => {
        const value = skillNav[spec.key];
        return (
          <label key={spec.key} className="debug-field">
            <span className="debug-field__label">
              {spec.label}
              <span className="debug-field__value">{value}</span>
            </span>
            <input
              type="range"
              min={spec.min}
              max={spec.max}
              step={spec.step}
              value={value}
              onChange={(e) => setSkillNav({ [spec.key]: Number(e.target.value) })}
            />
          </label>
        );
      })}

      <label className="debug-field">
        <span className="debug-field__label">
          Falloff f(x) — x: 0 at plateau edge → 1 at radius
        </span>
        <input
          type="text"
          className={`debug-input${compiled.error ? ' is-invalid' : ''}`}
          spellCheck={false}
          value={skillNav.easing}
          onChange={(e) => setSkillNav({ easing: e.target.value })}
          placeholder="1 - (3x^2 - 2x^3)"
        />
      </label>
      {compiled.error ? (
        <p className="debug-hint debug-hint--error">{compiled.error} — using default curve</p>
      ) : (
        <p className="debug-hint">vars: x · ops: + − × ÷ ^ · e.g. x, (1-x)^2, 1-x</p>
      )}

      <EasingPreview compiled={compiled} plateauFraction={plateauFraction} />

      <div className="debug-row">
        <button
          type="button"
          className="debug-btn"
          onClick={() => navigator.clipboard?.writeText(JSON.stringify(skillNav, null, 2))}
          title="Copy current values as JSON"
        >
          Copy JSON
        </button>
        <button type="button" className="debug-btn" onClick={resetSkillNav} title="Reset to defaults">
          Reset
        </button>
      </div>
      <p className="debug-hint">defaults: radius {SKILL_NAV_DEFAULTS.radius}, plateau {SKILL_NAV_DEFAULTS.plateau}</p>
    </>
  );
}

export function DebugSidebar() {
  const { dock, setDock, minimized, setMinimized } = useDebug();

  if (minimized) {
    return (
      <button
        type="button"
        className={`debug-handle debug-handle--${dock}`}
        onClick={() => setMinimized(false)}
        title="Open debug panel"
      >
        Debug
      </button>
    );
  }

  return (
    <aside className={`debug-sidebar debug-sidebar--${dock}`} aria-label="Debug panel">
      <header className="debug-sidebar__head">
        <span className="debug-sidebar__title">Debug</span>
        <div className="debug-sidebar__actions">
          <button
            type="button"
            className="debug-iconbtn"
            onClick={() => setDock(dock === 'left' ? 'right' : 'left')}
            title={`Dock ${dock === 'left' ? 'right' : 'left'}`}
          >
            {dock === 'left' ? '⇥' : '⇤'}
          </button>
          <button type="button" className="debug-iconbtn" onClick={() => setMinimized(true)} title="Minimize">
            —
          </button>
        </div>
      </header>

      <div className="debug-sidebar__body">
        <DebugSection title="Skill navigation behaviour">
          <SkillNavControls />
        </DebugSection>
      </div>
    </aside>
  );
}
