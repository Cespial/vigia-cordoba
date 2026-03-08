import { describe, it, expect } from 'vitest';
import {
  alertLevels,
  precipitationThresholds,
  dischargeThresholds,
  getAlertFromPrecipitation,
  getAlertFromDischarge,
  getCombinedAlert,
} from '@/data/thresholds';

describe('alertLevels', () => {
  it('should have 4 alert levels', () => {
    expect(Object.keys(alertLevels)).toHaveLength(4);
  });

  it('should have rojo, naranja, amarillo, verde', () => {
    expect(alertLevels.rojo).toBeDefined();
    expect(alertLevels.naranja).toBeDefined();
    expect(alertLevels.amarillo).toBeDefined();
    expect(alertLevels.verde).toBeDefined();
  });

  it('each level should have required fields', () => {
    Object.values(alertLevels).forEach(level => {
      expect(level.level).toBeDefined();
      expect(level.label).toBeDefined();
      expect(level.color).toBeDefined();
      expect(level.description).toBeDefined();
    });
  });

  it('each level should have a valid hex color', () => {
    Object.values(alertLevels).forEach(level => {
      expect(level.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('rojo should have the highest severity', () => {
    expect(alertLevels.rojo.label).toContain('Roja');
  });

  it('verde should indicate no alert', () => {
    expect(alertLevels.verde.label).toContain('Sin Alerta');
  });

  it('labels should be in Spanish', () => {
    expect(alertLevels.rojo.label).toContain('Alerta');
    expect(alertLevels.naranja.label).toContain('Alerta');
    expect(alertLevels.amarillo.label).toContain('Alerta');
  });

  it('descriptions should be in Spanish', () => {
    Object.values(alertLevels).forEach(level => {
      expect(level.description.length).toBeGreaterThan(10);
    });
  });
});

describe('precipitationThresholds', () => {
  it('verde max should be 20', () => {
    expect(precipitationThresholds.verde.max).toBe(20);
  });

  it('amarillo range should be 20-40', () => {
    expect(precipitationThresholds.amarillo.min).toBe(20);
    expect(precipitationThresholds.amarillo.max).toBe(40);
  });

  it('naranja range should be 40-70 (IDEAM standard)', () => {
    expect(precipitationThresholds.naranja.min).toBe(40);
    expect(precipitationThresholds.naranja.max).toBe(70);
  });

  it('rojo min should be 70', () => {
    expect(precipitationThresholds.rojo.min).toBe(70);
  });

  it('thresholds should be contiguous', () => {
    expect(precipitationThresholds.verde.max).toBe(precipitationThresholds.amarillo.min);
    expect(precipitationThresholds.amarillo.max).toBe(precipitationThresholds.naranja.min);
    expect(precipitationThresholds.naranja.max).toBe(precipitationThresholds.rojo.min);
  });
});

describe('dischargeThresholds', () => {
  it('verde max should be 300', () => {
    expect(dischargeThresholds.verde.max).toBe(300);
  });

  it('amarillo range should be 300-600', () => {
    expect(dischargeThresholds.amarillo.min).toBe(300);
    expect(dischargeThresholds.amarillo.max).toBe(600);
  });

  it('naranja range should be 600-1200', () => {
    expect(dischargeThresholds.naranja.min).toBe(600);
    expect(dischargeThresholds.naranja.max).toBe(1200);
  });

  it('rojo min should be 1200', () => {
    expect(dischargeThresholds.rojo.min).toBe(1200);
  });

  it('thresholds should be contiguous', () => {
    expect(dischargeThresholds.verde.max).toBe(dischargeThresholds.amarillo.min);
    expect(dischargeThresholds.amarillo.max).toBe(dischargeThresholds.naranja.min);
    expect(dischargeThresholds.naranja.max).toBe(dischargeThresholds.rojo.min);
  });
});

describe('getAlertFromPrecipitation', () => {
  it('should return verde for 0 mm', () => {
    expect(getAlertFromPrecipitation(0).level).toBe('verde');
  });

  it('should return verde for 10 mm', () => {
    expect(getAlertFromPrecipitation(10).level).toBe('verde');
  });

  it('should return verde for 19.9 mm', () => {
    expect(getAlertFromPrecipitation(19.9).level).toBe('verde');
  });

  it('should return amarillo for 20 mm', () => {
    expect(getAlertFromPrecipitation(20).level).toBe('amarillo');
  });

  it('should return amarillo for 30 mm', () => {
    expect(getAlertFromPrecipitation(30).level).toBe('amarillo');
  });

  it('should return amarillo for 39.9 mm', () => {
    expect(getAlertFromPrecipitation(39.9).level).toBe('amarillo');
  });

  it('should return naranja for 40 mm (IDEAM threshold)', () => {
    expect(getAlertFromPrecipitation(40).level).toBe('naranja');
  });

  it('should return naranja for 50 mm', () => {
    expect(getAlertFromPrecipitation(50).level).toBe('naranja');
  });

  it('should return naranja for 69.9 mm', () => {
    expect(getAlertFromPrecipitation(69.9).level).toBe('naranja');
  });

  it('should return rojo for 70 mm', () => {
    expect(getAlertFromPrecipitation(70).level).toBe('rojo');
  });

  it('should return rojo for 100 mm', () => {
    expect(getAlertFromPrecipitation(100).level).toBe('rojo');
  });

  it('should return rojo for extreme values', () => {
    expect(getAlertFromPrecipitation(500).level).toBe('rojo');
  });

  it('should return correct AlertLevel object structure', () => {
    const result = getAlertFromPrecipitation(50);
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('description');
  });
});

describe('getAlertFromDischarge', () => {
  it('should return verde for 0 m³/s', () => {
    expect(getAlertFromDischarge(0).level).toBe('verde');
  });

  it('should return verde for 200 m³/s', () => {
    expect(getAlertFromDischarge(200).level).toBe('verde');
  });

  it('should return verde for 299 m³/s', () => {
    expect(getAlertFromDischarge(299).level).toBe('verde');
  });

  it('should return amarillo for 300 m³/s', () => {
    expect(getAlertFromDischarge(300).level).toBe('amarillo');
  });

  it('should return amarillo for 500 m³/s', () => {
    expect(getAlertFromDischarge(500).level).toBe('amarillo');
  });

  it('should return naranja for 600 m³/s', () => {
    expect(getAlertFromDischarge(600).level).toBe('naranja');
  });

  it('should return naranja for 1000 m³/s', () => {
    expect(getAlertFromDischarge(1000).level).toBe('naranja');
  });

  it('should return rojo for 1200 m³/s', () => {
    expect(getAlertFromDischarge(1200).level).toBe('rojo');
  });

  it('should return rojo for 2500 m³/s (feb 2026 crisis level)', () => {
    expect(getAlertFromDischarge(2500).level).toBe('rojo');
  });
});

describe('getCombinedAlert', () => {
  it('should return verde when both are low', () => {
    expect(getCombinedAlert(5, 100).level).toBe('verde');
  });

  it('should take the higher alert level', () => {
    // rojo precip + verde discharge = rojo
    expect(getCombinedAlert(100, 100).level).toBe('rojo');
  });

  it('should take the higher alert from discharge', () => {
    // verde precip + rojo discharge = rojo
    expect(getCombinedAlert(5, 1500).level).toBe('rojo');
  });

  it('naranja precip + amarillo discharge = naranja', () => {
    expect(getCombinedAlert(50, 400).level).toBe('naranja');
  });

  it('amarillo precip + naranja discharge = naranja', () => {
    expect(getCombinedAlert(30, 800).level).toBe('naranja');
  });

  it('rojo precip + rojo discharge = rojo', () => {
    expect(getCombinedAlert(100, 1500).level).toBe('rojo');
  });

  it('verde + verde = verde', () => {
    expect(getCombinedAlert(0, 0).level).toBe('verde');
  });

  it('amarillo + amarillo = amarillo', () => {
    expect(getCombinedAlert(25, 400).level).toBe('amarillo');
  });

  it('should handle edge case: exactly at threshold boundaries', () => {
    expect(getCombinedAlert(40, 600).level).toBe('naranja');
    expect(getCombinedAlert(70, 1200).level).toBe('rojo');
    expect(getCombinedAlert(20, 300).level).toBe('amarillo');
  });
});
