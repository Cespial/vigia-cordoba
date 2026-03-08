import { describe, it, expect } from 'vitest';
import {
  alertLevels,
  precipitationThresholds,
  dischargeThresholds,
  getAlertFromPrecipitation,
  getAlertFromDischarge,
  getCombinedAlert,
} from '@/data/thresholds';

describe('Alert Levels — Properties', () => {
  it('rojo label should contain "Roja"', () => {
    expect(alertLevels.rojo.label).toContain('Roja');
  });

  it('naranja label should contain "Naranja"', () => {
    expect(alertLevels.naranja.label).toContain('Naranja');
  });

  it('verde description should indicate normal', () => {
    expect(alertLevels.verde.description).toContain('normal');
  });

  it('rojo description should mention evacuation', () => {
    expect(alertLevels.rojo.description.toLowerCase()).toContain('evacu');
  });

  it('all alert colors should be valid hex', () => {
    Object.values(alertLevels).forEach(al => {
      expect(al.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('rojo should be reddish (starts with high R value)', () => {
    const r = parseInt(alertLevels.rojo.color.slice(1, 3), 16);
    expect(r).toBeGreaterThan(180);
  });

  it('verde should be greenish', () => {
    const g = parseInt(alertLevels.verde.color.slice(3, 5), 16);
    expect(g).toBeGreaterThan(150);
  });
});

describe('Precipitation Thresholds — Boundary Analysis', () => {
  it('verde max should equal amarillo min', () => {
    expect(precipitationThresholds.verde.max).toBe(precipitationThresholds.amarillo.min);
  });

  it('amarillo max should equal naranja min', () => {
    expect(precipitationThresholds.amarillo.max).toBe(precipitationThresholds.naranja.min);
  });

  it('naranja max should equal rojo min', () => {
    expect(precipitationThresholds.naranja.max).toBe(precipitationThresholds.rojo.min);
  });

  it('verde max should be 20mm', () => {
    expect(precipitationThresholds.verde.max).toBe(20);
  });

  it('rojo min should be 70mm', () => {
    expect(precipitationThresholds.rojo.min).toBe(70);
  });
});

describe('Discharge Thresholds — Boundary Analysis', () => {
  it('verde max should equal amarillo min', () => {
    expect(dischargeThresholds.verde.max).toBe(dischargeThresholds.amarillo.min);
  });

  it('amarillo max should equal naranja min', () => {
    expect(dischargeThresholds.amarillo.max).toBe(dischargeThresholds.naranja.min);
  });

  it('naranja max should equal rojo min', () => {
    expect(dischargeThresholds.naranja.max).toBe(dischargeThresholds.rojo.min);
  });

  it('verde max should be 300 m³/s', () => {
    expect(dischargeThresholds.verde.max).toBe(300);
  });

  it('rojo min should be 1200 m³/s', () => {
    expect(dischargeThresholds.rojo.min).toBe(1200);
  });
});

describe('getAlertFromPrecipitation — Systematic', () => {
  const cases: [number, string][] = [
    [0, 'verde'],
    [1, 'verde'],
    [10, 'verde'],
    [19, 'verde'],
    [19.99, 'verde'],
    [20, 'amarillo'],
    [25, 'amarillo'],
    [30, 'amarillo'],
    [39, 'amarillo'],
    [39.99, 'amarillo'],
    [40, 'naranja'],
    [50, 'naranja'],
    [60, 'naranja'],
    [69, 'naranja'],
    [69.99, 'naranja'],
    [70, 'rojo'],
    [80, 'rojo'],
    [100, 'rojo'],
    [500, 'rojo'],
  ];

  cases.forEach(([mm, expected]) => {
    it(`${mm}mm should be ${expected}`, () => {
      expect(getAlertFromPrecipitation(mm).level).toBe(expected);
    });
  });
});

describe('getAlertFromDischarge — Systematic', () => {
  const cases: [number, string][] = [
    [0, 'verde'],
    [50, 'verde'],
    [100, 'verde'],
    [200, 'verde'],
    [299, 'verde'],
    [299.99, 'verde'],
    [300, 'amarillo'],
    [400, 'amarillo'],
    [500, 'amarillo'],
    [599, 'amarillo'],
    [599.99, 'amarillo'],
    [600, 'naranja'],
    [700, 'naranja'],
    [900, 'naranja'],
    [1199, 'naranja'],
    [1199.99, 'naranja'],
    [1200, 'rojo'],
    [1500, 'rojo'],
    [2000, 'rojo'],
    [5000, 'rojo'],
  ];

  cases.forEach(([discharge, expected]) => {
    it(`${discharge} m³/s should be ${expected}`, () => {
      expect(getAlertFromDischarge(discharge).level).toBe(expected);
    });
  });
});

describe('getCombinedAlert — Matrix Coverage', () => {
  it('verde + verde = verde', () => {
    expect(getCombinedAlert(0, 0).level).toBe('verde');
  });

  it('verde + amarillo = amarillo', () => {
    expect(getCombinedAlert(0, 400).level).toBe('amarillo');
  });

  it('verde + naranja = naranja', () => {
    expect(getCombinedAlert(0, 800).level).toBe('naranja');
  });

  it('verde + rojo = rojo', () => {
    expect(getCombinedAlert(0, 1500).level).toBe('rojo');
  });

  it('amarillo + verde = amarillo', () => {
    expect(getCombinedAlert(30, 0).level).toBe('amarillo');
  });

  it('amarillo + amarillo = amarillo', () => {
    expect(getCombinedAlert(30, 400).level).toBe('amarillo');
  });

  it('amarillo + naranja = naranja', () => {
    expect(getCombinedAlert(30, 800).level).toBe('naranja');
  });

  it('amarillo + rojo = rojo', () => {
    expect(getCombinedAlert(30, 1500).level).toBe('rojo');
  });

  it('naranja + verde = naranja', () => {
    expect(getCombinedAlert(50, 0).level).toBe('naranja');
  });

  it('naranja + amarillo = naranja', () => {
    expect(getCombinedAlert(50, 400).level).toBe('naranja');
  });

  it('naranja + naranja = naranja', () => {
    expect(getCombinedAlert(50, 800).level).toBe('naranja');
  });

  it('naranja + rojo = rojo', () => {
    expect(getCombinedAlert(50, 1500).level).toBe('rojo');
  });

  it('rojo + verde = rojo', () => {
    expect(getCombinedAlert(80, 0).level).toBe('rojo');
  });

  it('rojo + amarillo = rojo', () => {
    expect(getCombinedAlert(80, 400).level).toBe('rojo');
  });

  it('rojo + naranja = rojo', () => {
    expect(getCombinedAlert(80, 800).level).toBe('rojo');
  });

  it('rojo + rojo = rojo', () => {
    expect(getCombinedAlert(80, 1500).level).toBe('rojo');
  });
});

describe('getCombinedAlert — Symmetry', () => {
  const precipValues = [0, 30, 50, 80];
  const dischargeValues = [0, 400, 800, 1500];

  it('max severity always wins regardless of source', () => {
    for (const p of precipValues) {
      for (const d of dischargeValues) {
        const combined = getCombinedAlert(p, d);
        const precipAlert = getAlertFromPrecipitation(p);
        const dischargeAlert = getAlertFromDischarge(d);
        const order = ['rojo', 'naranja', 'amarillo', 'verde'];
        const maxIdx = Math.min(order.indexOf(precipAlert.level), order.indexOf(dischargeAlert.level));
        expect(combined.level).toBe(order[maxIdx]);
      }
    }
  });
});

describe('Alert return types', () => {
  it('getAlertFromPrecipitation returns full AlertLevel object', () => {
    const result = getAlertFromPrecipitation(50);
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('description');
  });

  it('getAlertFromDischarge returns full AlertLevel object', () => {
    const result = getAlertFromDischarge(500);
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('description');
  });

  it('getCombinedAlert returns full AlertLevel object', () => {
    const result = getCombinedAlert(30, 500);
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('description');
  });
});
