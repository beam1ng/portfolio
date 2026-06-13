import { Link } from 'react-router-dom';
import type { Technology } from '@portfolio/api-client';

interface TechTagProps {
  tech: Technology;
  /** When set, the tag renders as a link to this route. */
  to?: string;
}

/** A technology pill with an optional CDN logo; optionally a link. */
export function TechTag({ tech, to }: TechTagProps) {
  const inner = (
    <>
      {tech.iconUrl && (
        <img className="tag__icon" src={tech.iconUrl} alt="" loading="lazy" width={14} height={14} />
      )}
      {tech.name}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="tag tag--link" title={`Projects using ${tech.name}`}>
        {inner}
      </Link>
    );
  }

  return <span className="tag">{inner}</span>;
}
