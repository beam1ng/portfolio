import { describe, expect, it } from 'vitest';
import { formatDateRange, formatMonthYear, proficiencyLabel } from './format';

describe('proficiencyLabel', () => {
  it('maps known levels to labels', () => {
    expect(proficiencyLabel(1)).toBe('Beginner');
    expect(proficiencyLabel(4)).toBe('Advanced');
    expect(proficiencyLabel(5)).toBe('Expert');
  });

  it('returns Unknown for out-of-range levels', () => {
    expect(proficiencyLabel(0)).toBe('Unknown');
    expect(proficiencyLabel(99)).toBe('Unknown');
  });
});

describe('formatMonthYear', () => {
  it('formats an ISO date as month + year', () => {
    expect(formatMonthYear('2023-04-01')).toBe('Apr 2023');
  });

  it('treats null as Present', () => {
    expect(formatMonthYear(null)).toBe('Present');
  });
});

describe('formatDateRange', () => {
  it('renders a start–end range', () => {
    expect(formatDateRange('2022-01-01', '2023-06-01')).toBe('Jan 2022 – Jun 2023');
  });

  it('uses Present for an open end date', () => {
    expect(formatDateRange('2024-02-01', null)).toBe('Feb 2024 – Present');
  });

  it('returns null when there is no start date', () => {
    expect(formatDateRange(null, null)).toBeNull();
  });
});
