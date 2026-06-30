import { Fragment, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import type { Technology } from '@portfolio/api-client';
import { useProjects, useTechnologies } from '../api/queries';
import { SkillMeter } from '../components/skills/SkillMeter';
import { ErrorState, LoadingState } from '../components/ui/States';
import { projectsUsingTech } from '../lib/crossref';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useSkillNavParams } from '../debug/DebugContext';
import { compileEasing } from '../debug/easing';
import './pages.css';

const ALL = 'All';
const DEFAULT_FILTER = 'Backend';

// Preferred filter order; anything else falls to the end, alphabetically.
const DOMAIN_ORDER = ['Backend', 'Frontend', 'Game Dev', 'Data', 'DevOps', 'Graphics', 'Tools'];

/** A technology can belong to several domains, stored comma-separated. */
function domainsOf(tech: Technology): string[] {
  return (tech.category ?? '').split(',').map((part) => part.trim()).filter(Boolean);
}

export function SkillsPage() {
  const query = useTechnologies();
  const projects = useProjects(false).data ?? [];
  useDocumentTitle('Skills');
  const technologies = query.data ?? [];

  const filters = useMemo(() => {
    const set = new Set<string>();
    for (const tech of technologies) for (const domain of domainsOf(tech)) set.add(domain);
    const rank = (name: string) => {
      const index = DOMAIN_ORDER.indexOf(name);
      return index === -1 ? DOMAIN_ORDER.length : index;
    };
    const ordered = [...set].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
    return [ALL, ...ordered];
  }, [technologies]);

  const [active, setActive] = useState(DEFAULT_FILTER);
  const selected = filters.includes(active) ? active : ALL;

  // Dock-style magnification driven by the cursor's X position over a generous
  // zone: the nearest inactive filter grows most and the effect tapers off with
  // distance, so options are easy to aim at even when the cursor is above/below
  // the text. The active filter is excluded — it stays fixed. All sizing is via
  // transform: scale() on a constant font-size (no jitter). Parameters and the
  // falloff curve are live-tunable from the admin debug sidebar.
  const params = useSkillNavParams();
  const easing = useMemo(() => compileEasing(params.easing), [params.easing]);
  type Center = { x: number; y: number };
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const centers = useRef<Center[]>([]);
  const raf = useRef<number | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  const measureCenters = () => {
    centers.current = filters.map((_, index) => {
      const el = itemRefs.current.get(index);
      if (!el) return { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
  };

  const onPointerMove = (event: MouseEvent<HTMLElement>) => {
    const x = event.clientX;
    const y = event.clientY;
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setPointer({ x, y }));
  };

  const onPointerLeave = () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    setPointer(null);
  };

  const scaleFor = (index: number, filter: string): number => {
    const { activeScale, inactiveScale, maxBoost, radius, plateau, vertTol } = params;
    if (filter === selected) return activeScale; // never magnified, just largest
    if (pointer === null) return inactiveScale;
    const center = centers.current[index];
    if (!center || !Number.isFinite(center.x)) return inactiveScale;
    if (Math.abs(pointer.y - center.y) > vertTol) return inactiveScale; // other row
    const distance = Math.abs(pointer.x - center.x);
    if (distance >= radius) return inactiveScale;
    if (distance <= plateau) return inactiveScale + maxBoost; // flat max zone
    const span = Math.max(1, radius - plateau);
    const x = (distance - plateau) / span; // 0..1 past the plateau
    const raw = easing.fn(x);
    const fall = Number.isFinite(raw) ? raw : 0; // guard pathological curves
    return Math.min(3, Math.max(0.2, inactiveScale + maxBoost * fall)); // clamp sane
  };

  // The category a click at the cursor would land on: the nearest inactive
  // centre within the active row and reach. Drives an extra colour cue.
  // Nearest category centre to a point, within the same row (vertTol) and an
  // optional max distance. Drives both the colour cue and click-to-nearest.
  const nearestIndex = (px: number, py: number, maxDistance: number): number => {
    let best = -1;
    let bestDistance = Number.POSITIVE_INFINITY;
    filters.forEach((_filter, index) => {
      const center = centers.current[index];
      if (!center || !Number.isFinite(center.x)) return;
      if (Math.abs(py - center.y) > params.vertTol) return;
      const distance = Math.abs(px - center.x);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    return bestDistance <= maxDistance ? best : -1;
  };

  // The category a click at the cursor would select (the "step" target).
  const winnerIndex = pointer ? nearestIndex(pointer.x, pointer.y, params.radius) : -1;

  // Brightness blends two signals by a ratio: the shared curve and a step that
  // is 1 only for the click-target category. colorStepMix is the step's weight.
  const brightnessFor = (index: number, scale: number): number => {
    const { inactiveScale, maxBoost, colorStepMix } = params;
    const curve = maxBoost > 0 ? Math.min(1, Math.max(0, (scale - inactiveScale) / maxBoost)) : 0;
    const step = index === winnerIndex ? 1 : 0;
    return Math.min(1, Math.max(0, (1 - colorStepMix) * curve + colorStepMix * step));
  };

  // Clicking anywhere in the row (gaps and separators included) selects the
  // nearest category, so the cue's click target is exactly what gets chosen.
  const onNavClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('.skill-filter__item')) return; // a button handles its own click
    measureCenters();
    const index = nearestIndex(event.clientX, event.clientY, Number.POSITIVE_INFINITY);
    if (index >= 0) {
      const filter = filters[index];
      if (filter) setActive(filter);
    }
  };

  const shown = (selected === ALL ? technologies : technologies.filter((tech) => domainsOf(tech).includes(selected)))
    .slice()
    .sort((a, b) => b.proficiency - a.proficiency || a.name.localeCompare(b.name));

  return (
    <section className="container section">
      <div className="section-head">
        <div>
          <span className="eyebrow">What I work with</span>
          <h1 className="section-title">Skills</h1>
        </div>
      </div>

      {query.isPending && <LoadingState label="Loading skills…" />}
      {query.isError && <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />}
      {query.isSuccess && (
        <>
          <nav
            className="skill-filter"
            aria-label="Filter skills by area"
            style={{ '--skill-tr': `${params.transitionMs}ms` } as CSSProperties}
            onClick={onNavClick}
            onMouseEnter={measureCenters}
            onMouseMove={onPointerMove}
            onMouseLeave={onPointerLeave}
          >
            {filters.map((filter, index) => {
              const isActive = selected === filter;
              const scale = scaleFor(index, filter);
              const t = isActive ? 1 : brightnessFor(index, scale);
              return (
                <Fragment key={filter}>
                  {index > 0 && <span className="skill-filter__sep" aria-hidden="true">/</span>}
                  <button
                    ref={(el) => {
                      if (el) itemRefs.current.set(index, el);
                      else itemRefs.current.delete(index);
                    }}
                    type="button"
                    className={`skill-filter__item${isActive ? ' is-active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => setActive(filter)}
                    style={{
                      transform: `scale(${scale})`,
                      color: isActive
                        ? undefined
                        : `color-mix(in oklch, var(--color-text), var(--color-text-muted) ${((1 - t) * 100).toFixed(1)}%)`,
                      opacity: isActive ? undefined : 0.7 + 0.3 * t,
                    }}
                  >
                    {filter}
                  </button>
                </Fragment>
              );
            })}
          </nav>

          <ul key={selected} className="skill-grid">
            {shown.map((tech, index) => (
              <SkillMeter
                key={tech.id}
                index={index}
                name={tech.name}
                level={tech.proficiency}
                techSlug={tech.slug}
                iconUrl={tech.iconUrl}
                usedIn={projectsUsingTech(projects, tech.slug)}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
