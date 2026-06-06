import type { Technology } from '@portfolio/api-client';

/** A technology pill with an optional CDN logo. */
export function TechTag({ tech }: { tech: Technology }) {
  return (
    <span className="tag">
      {tech.iconUrl && (
        <img className="tag__icon" src={tech.iconUrl} alt="" loading="lazy" width={14} height={14} />
      )}
      {tech.name}
    </span>
  );
}
