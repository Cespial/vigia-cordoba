import { describe, it, expect } from 'vitest';
import { getAlertFromPrecipitation, getAlertFromDischarge, getCombinedAlert } from '@/data/thresholds';
import { formatNumber, cn, formatDate, formatShortDate } from '@/lib/utils';
import { municipalities } from '@/data/municipalities';

describe('Edge cases — Threshold boundaries', () => {
  it('precipitation exactly at 0', () => {
    expect(getAlertFromPrecipitation(0).level).toBe('verde');
  });

  it('precipitation at -1 (negative, shouldn\'t happen)', () => {
    expect(getAlertFromPrecipitation(-1).level).toBe('verde');
  });

  it('precipitation at Number.MAX_SAFE_INTEGER', () => {
    expect(getAlertFromPrecipitation(Number.MAX_SAFE_INTEGER).level).toBe('rojo');
  });

  it('precipitation at 19.99999', () => {
    expect(getAlertFromPrecipitation(19.99999).level).toBe('verde');
  });

  it('precipitation at 20.00001', () => {
    expect(getAlertFromPrecipitation(20.00001).level).toBe('amarillo');
  });

  it('precipitation at 39.99999', () => {
    expect(getAlertFromPrecipitation(39.99999).level).toBe('amarillo');
  });

  it('precipitation at 40.00001', () => {
    expect(getAlertFromPrecipitation(40.00001).level).toBe('naranja');
  });

  it('precipitation at 69.99999', () => {
    expect(getAlertFromPrecipitation(69.99999).level).toBe('naranja');
  });

  it('precipitation at 70.00001', () => {
    expect(getAlertFromPrecipitation(70.00001).level).toBe('rojo');
  });

  it('discharge exactly at 0', () => {
    expect(getAlertFromDischarge(0).level).toBe('verde');
  });

  it('discharge at 299.999', () => {
    expect(getAlertFromDischarge(299.999).level).toBe('verde');
  });

  it('discharge at 300.001', () => {
    expect(getAlertFromDischarge(300.001).level).toBe('amarillo');
  });

  it('discharge at 599.999', () => {
    expect(getAlertFromDischarge(599.999).level).toBe('amarillo');
  });

  it('discharge at 600.001', () => {
    expect(getAlertFromDischarge(600.001).level).toBe('naranja');
  });

  it('discharge at 1199.999', () => {
    expect(getAlertFromDischarge(1199.999).level).toBe('naranja');
  });

  it('discharge at 1200.001', () => {
    expect(getAlertFromDischarge(1200.001).level).toBe('rojo');
  });
});

describe('Edge cases — Combined alerts', () => {
  it('both at zero', () => {
    expect(getCombinedAlert(0, 0).level).toBe('verde');
  });

  it('precip rojo, discharge verde', () => {
    expect(getCombinedAlert(100, 50).level).toBe('rojo');
  });

  it('precip verde, discharge rojo', () => {
    expect(getCombinedAlert(5, 2000).level).toBe('rojo');
  });

  it('both at exact boundary naranja', () => {
    expect(getCombinedAlert(40, 600).level).toBe('naranja');
  });

  it('both at exact boundary amarillo', () => {
    expect(getCombinedAlert(20, 300).level).toBe('amarillo');
  });

  it('mixed: amarillo precip, naranja discharge', () => {
    const result = getCombinedAlert(30, 700);
    expect(result.level).toBe('naranja');
  });

  it('mixed: naranja precip, amarillo discharge', () => {
    const result = getCombinedAlert(50, 350);
    expect(result.level).toBe('naranja');
  });
});

describe('Edge cases — Formatting', () => {
  it('formatNumber with very large number', () => {
    const result = formatNumber(999999999);
    expect(result).toBeTruthy();
  });

  it('formatNumber with 0.1', () => {
    const result = formatNumber(0.1, 1);
    expect(result).toContain('0');
  });

  it('formatNumber with negative', () => {
    const result = formatNumber(-42);
    expect(result).toBeTruthy();
  });

  it('cn with all falsy', () => {
    expect(cn(false, null, undefined, '')).toBe('');
  });

  it('cn with mixed values', () => {
    expect(cn('a', false, 'b', null, 'c')).toBe('a b c');
  });

  it('formatDate with ISO string with timezone', () => {
    const result = formatDate('2026-06-15T10:30:00+05:00');
    expect(result).toContain('2026');
  });

  it('formatShortDate with leap year date', () => {
    const result = formatShortDate('2024-02-29');
    expect(result).toBe('29/02');
  });

  it('formatDate with only year-month', () => {
    // This should handle gracefully
    const result = formatDate('2026-03');
    expect(result).toBeTruthy();
  });
});

describe('Edge cases — Municipality lookups', () => {
  it('should find municipality by exact slug match', () => {
    const found = municipalities.find(m => m.slug === 'monteria');
    expect(found).toBeDefined();
    expect(found!.name).toBe('Montería');
  });

  it('should not find municipality with wrong case', () => {
    const found = municipalities.find(m => m.slug === 'Monteria');
    expect(found).toBeUndefined();
  });

  it('should not find non-existent municipality', () => {
    const found = municipalities.find(m => m.slug === 'bogota');
    expect(found).toBeUndefined();
  });

  it('filter by cuenca should return consistent results', () => {
    const sinuMedia = municipalities.filter(m => m.cuenca === 'Sinú Media');
    expect(sinuMedia.length).toBeGreaterThanOrEqual(3);
    sinuMedia.forEach(m => expect(m.cuenca).toBe('Sinú Media'));
  });

  it('filter by priority Alta should include key cities', () => {
    const alta = municipalities.filter(m => m.priority === 'Alta');
    const names = alta.map(m => m.name);
    expect(names).toContain('Montería');
    expect(names).toContain('Lorica');
    expect(names).toContain('Tierralta');
  });
});
