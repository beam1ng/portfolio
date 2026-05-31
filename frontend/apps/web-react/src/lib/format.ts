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
