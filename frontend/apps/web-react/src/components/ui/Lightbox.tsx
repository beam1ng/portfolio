import { useCallback, useEffect, useState } from 'react';
import type { ProjectImage } from '@portfolio/api-client';
import './lightbox.css';

interface LightboxProps {
  images: readonly ProjectImage[];
  startIndex: number;
  onClose: () => void;
}

/**
 * Full-screen image viewer for the project gallery: zoom, browse with the
 * on-screen arrows or ← / → keys, close with Esc or a backdrop click.
 */
export function Lightbox({ images, startIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const count = images.length;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') go(1);
      else if (event.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [go, onClose]);

  const image = images[index];
  if (!image) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}>
      <button type="button" className="lightbox__btn lightbox__close" onClick={onClose} aria-label="Close viewer">
        ✕
      </button>
      {count > 1 && <span className="lightbox__counter">{index + 1} / {count}</span>}

      {count > 1 && (
        <button
          type="button"
          className="lightbox__btn lightbox__nav lightbox__nav--prev"
          onClick={(event) => { event.stopPropagation(); go(-1); }}
          aria-label="Previous image"
        >
          ‹
        </button>
      )}

      <figure className="lightbox__figure" onClick={(event) => event.stopPropagation()}>
        <img className="lightbox__img" src={image.imageUrl} alt={image.caption ?? ''} />
        {image.caption && <figcaption className="lightbox__caption">{image.caption}</figcaption>}
      </figure>

      {count > 1 && (
        <button
          type="button"
          className="lightbox__btn lightbox__nav lightbox__nav--next"
          onClick={(event) => { event.stopPropagation(); go(1); }}
          aria-label="Next image"
        >
          ›
        </button>
      )}
    </div>
  );
}
