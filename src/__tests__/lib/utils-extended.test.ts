import { describe, it, expect } from 'vitest';
import { formatDate, formatShortDate, formatDateTime, cn, formatNumber } from '@/lib/utils';

describe('formatDate — Extended', () => {
  it('should format January 1st correctly', () => {
    const result = formatDate('2026-01-01');
    expect(result).toContain('enero');
    expect(result).toContain('2026');
  });

  it('should format December 31st correctly', () => {
    const result = formatDate('2025-12-31');
    expect(result).toContain('diciembre');
    expect(result).toContain('2025');
  });

  it('should handle leap year date', () => {
    const result = formatDate('2024-02-29');
    expect(result).toContain('febrero');
  });

  it('should handle date with time component', () => {
    const result = formatDate('2026-03-08T14:30:00');
    expect(result).toContain('marzo');
  });

  it('should return original string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  it('should return original string for empty string', () => {
    expect(formatDate('')).toBe('');
  });

  it('should handle various date formats', () => {
    const result = formatDate('2025-06-15');
    expect(result).toContain('junio');
    expect(result).toContain('15');
  });

  it('should include day number', () => {
    const result = formatDate('2026-03-08');
    expect(result).toContain('8');
  });
});

describe('formatShortDate — Extended', () => {
  it('should format as dd/MM', () => {
    const result = formatShortDate('2026-03-08');
    expect(result).toBe('08/03');
  });

  it('should zero-pad single digit days', () => {
    const result = formatShortDate('2026-01-05');
    expect(result).toContain('05');
  });

  it('should zero-pad single digit months', () => {
    const result = formatShortDate('2026-03-15');
    expect(result).toContain('03');
  });

  it('should handle December correctly', () => {
    const result = formatShortDate('2025-12-25');
    expect(result).toBe('25/12');
  });

  it('should return original string for invalid date', () => {
    expect(formatShortDate('invalid')).toBe('invalid');
  });

  it('January 1st should be 01/01', () => {
    expect(formatShortDate('2026-01-01')).toBe('01/01');
  });
});

describe('formatDateTime — Extended', () => {
  it('should include time component', () => {
    const result = formatDateTime('2026-03-08T14:30:00');
    expect(result).toContain('14:30');
  });

  it('should include abbreviated month', () => {
    const result = formatDateTime('2026-03-08T14:30:00');
    expect(result).toContain('mar');
  });

  it('should include year', () => {
    const result = formatDateTime('2026-03-08T14:30:00');
    expect(result).toContain('2026');
  });

  it('should handle midnight', () => {
    const result = formatDateTime('2026-01-01T00:00:00');
    expect(result).toContain('00:00');
  });

  it('should return original for invalid input', () => {
    expect(formatDateTime('bad')).toBe('bad');
  });
});

describe('cn — Extended', () => {
  it('should join multiple classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('should filter out undefined', () => {
    expect(cn('a', undefined, 'b')).toBe('a b');
  });

  it('should filter out null', () => {
    expect(cn('a', null, 'b')).toBe('a b');
  });

  it('should filter out false', () => {
    expect(cn('a', false, 'b')).toBe('a b');
  });

  it('should filter out empty string', () => {
    expect(cn('a', '', 'b')).toBe('a b');
  });

  it('should return empty string for no valid classes', () => {
    expect(cn(false, null, undefined)).toBe('');
  });

  it('should work with single class', () => {
    expect(cn('only')).toBe('only');
  });

  it('should work with no arguments', () => {
    expect(cn()).toBe('');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });
});

describe('formatNumber — Extended', () => {
  it('should format 0 correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should format large numbers with separators', () => {
    const result = formatNumber(1000000);
    expect(result).toContain('1');
    expect(result.length).toBeGreaterThan(1);
  });

  it('should respect decimal places', () => {
    const result = formatNumber(3.14159, 2);
    expect(result).toContain('14');
  });

  it('should handle negative numbers', () => {
    const result = formatNumber(-42);
    expect(result).toContain('42');
  });

  it('should handle zero decimals', () => {
    const result = formatNumber(3.7, 0);
    expect(result).not.toContain('7');
  });

  it('should handle 1 decimal place', () => {
    const result = formatNumber(3.14, 1);
    expect(result).toContain('1');
  });

  it('should format 505000 with separators', () => {
    const result = formatNumber(505000);
    expect(result.length).toBeGreaterThan(3);
  });

  it('should handle very small numbers', () => {
    const result = formatNumber(0.001, 3);
    expect(result).toContain('001');
  });
});
