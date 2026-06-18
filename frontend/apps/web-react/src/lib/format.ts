/** Maps the backend ProficiencyLevel int (1–5) to a human label. */
const PROFICIENCY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export function proficiencyLabel(level: number): string {
  return PROFICIENCY_LABELS[level] ?? 'Unknown';
}

/** Formats an ISO date (`2023-04-01`) as e.g. `Apr 2023`; null → "Present". */
export function formatMonthYear(iso: string | null): string {
  if (!iso) {
    return 'Present';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Renders a start/end range, e.g. `Apr 2023 – Present`. */
export function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start) {
    return null;
  }
  return `${formatMonthYear(start)} – ${formatMonthYear(end)}`;
}

/**
 * Splits a multi-paragraph bio into a short hero lead (first paragraph) and the
 * remaining paragraphs for an About section. Falls back gracefully for a
 * single-paragraph bio.
 */
export function splitBio(bio: string): { lead: string; rest: readonly string[] } {
  const paragraphs = bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) {
    return { lead: '', rest: [] };
  }
  return { lead: paragraphs[0] ?? '', rest: paragraphs.slice(1) };
}
