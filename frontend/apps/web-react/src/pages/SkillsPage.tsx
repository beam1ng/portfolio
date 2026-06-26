import { Fragment, useMemo, useRef, useState, type MouseEvent } from 'react';
import type { Technology } from '@portfolio/api-client';
import { useProjects, useTechnologies } from '../api/queries';
import { SkillMeter } from '../components/skills/SkillMeter';
import { ErrorState, LoadingState } from '../components/ui/States';
import { projectsUsingTech } from '../lib/crossref';
import { useDocumentTitle } from '../lib/useDocumentTitle';
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
  // zone: the closest inactive filter grows most and the effect tapers off with
  // distance, so options are easy to aim at even when the cursor is above/below
  // the text. The active filter is excluded — it stays fixed.
  const RADIUS = 110; // px on each side of the cursor that the effect reaches
  const PLATEAU = 55; // within this distance the boost stays at full (flat top)
  // All sizing is expressed through transform: scale() on a constant font-size,
  // so glyphs never re-rasterise mid-animation (no jitter).
  const ACTIVE_SCALE = 1.18; // selected category reads largest
  const INACTIVE_SCALE = 0.9; // off categories rest a little smaller
  const MAX_BOOST = 0.22; // hover adds up to this on top of the rest scale
  const VERT_TOL = 24; // vertical hit tolerance, so the row magnifies even when
  // the cursor sits above/below the glyphs — but a wrapped second row does not.
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
    if (filter === selected) return ACTIVE_SCALE; // never magnified, just largest
    if (pointer === null) return INACTIVE_SCALE;
    const center = centers.current[index];
    if (!center || !Number.isFinite(center.x)) return INACTIVE_SCALE;
    if (Math.abs(pointer.y - center.y) > VERT_TOL) return INACTIVE_SCALE; // other row
    const distance = Math.abs(pointer.x - center.x);
    if (distance >= RADIUS) return INACTIVE_SCALE;
    if (distance <= PLATEAU) return INACTIVE_SCALE + MAX_BOOST; // flat max zone
    const e = (distance - PLATEAU) / (RADIUS - PLATEAU); // 0..1 past the plateau
    const fall = 1 - e * e * (3 - 2 * e); // smoothstep falloff to 0
    return INACTIVE_SCALE + MAX_BOOST * fall;
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
            onMouseEnter={measureCenters}
            onMouseMove={onPointerMove}
            onMouseLeave={onPointerLeave}
          >
            {filters.map((filter, index) => {
              const isActive = selected === filter;
              const scale = scaleFor(index, filter);
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
                      color: !isActive && scale > 0.98 ? 'var(--color-text)' : undefined,
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
