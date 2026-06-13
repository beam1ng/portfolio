import { useEffect } from 'react';

const SUFFIX = 'Jakub Augustyniak';

/**
 * Sets the document title for the current page, restoring the base title on
 * unmount. Pass a page label (e.g. "Projects") or null for the base title.
 */
export function useDocumentTitle(label: string | null): void {
  useEffect(() => {
    const base = `${SUFFIX} — Portfolio`;
    document.title = label ? `${label} — ${SUFFIX}` : base;
    return () => {
      document.title = base;
    };
  }, [label]);
}
