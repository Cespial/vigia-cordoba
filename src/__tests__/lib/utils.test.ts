import { describe, it, expect } from 'vitest';
import { formatDate, formatShortDate, formatDateTime, cn, formatNumber } from '@/lib/utils';

describe('formatDate', () => {
  it('should format a valid ISO date', () => {
    const result = formatDate('2026-03-01');
    expect(result).toContain('2026');
    expect(result).toContain('marzo');
  });

  it('should handle date with time', () => {
    const result = formatDate('2026-02-15T10:30:00Z');
    expect(result).toContain('2026');
    expect(result).toContain('febrero');
  });

  it('should return original string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  it('should return original string for empty string', () => {
    expect(formatDate('')).toBe('');
  });

  it('should format January correctly', () => {
    const result = formatDate('2026-01-15');
    expect(result).toContain('enero');
  });

  it('should format December correctly', () => {
    const result = formatDate('2025-12-25');
    expect(result).toContain('diciembre');
  });
});

describe('formatShortDate', () => {
  it('should format as dd/MM', () => {
    const result = formatShortDate('2026-03-08');
    expect(result).toBe('08/03');
  });

  it('should handle single digit days', () => {
    const result = formatShortDate('2026-01-05');
    expect(result).toBe('05/01');
  });

  it('should return original string for invalid date', () => {
    expect(formatShortDate('invalid')).toBe('invalid');
  });
});

describe('formatDateTime', () => {
  it('should include date and time', () => {
    const result = formatDateTime('2026-03-08T14:30:00Z');
    expect(result).toContain('2026');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('should return original string for invalid date', () => {
    expect(formatDateTime('bad')).toBe('bad');
  });
});

describe('cn', () => {
  it('should join class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should filter out falsy values', () => {
    expect(cn('foo', null, 'bar', undefined, false)).toBe('foo bar');
  });

  it('should return empty string for no valid classes', () => {
    expect(cn(null, undefined, false)).toBe('');
  });

  it('should handle single class', () => {
    expect(cn('solo')).toBe('solo');
  });

  it('should handle empty string input', () => {
    expect(cn('')).toBe('');
  });
});

describe('formatNumber', () => {
  it('should format integers', () => {
    const result = formatNumber(1000);
    // Spanish locale uses period or non-breaking space as thousands separator
    expect(result).toMatch(/1[.\s]?000/);
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    const result = formatNumber(-500);
    expect(result).toContain('500');
  });

  it('should respect decimal places', () => {
    const result = formatNumber(3.14159, 2);
    expect(result).toContain('3');
    expect(result).toContain('14');
  });

  it('should default to 0 decimal places', () => {
    const result = formatNumber(3.7);
    expect(result).toBe('4');
  });

  it('should format large numbers', () => {
    const result = formatNumber(505000);
    expect(result).toMatch(/505[.\s]?000/);
  });

  it('should handle 1 decimal place', () => {
    const result = formatNumber(42.567, 1);
    expect(result).toContain('42');
  });
});
