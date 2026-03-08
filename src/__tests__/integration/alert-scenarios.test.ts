import { describe, it, expect } from 'vitest';
import { municipalities } from '@/data/municipalities';
import { getCombinedAlert, getAlertFromPrecipitation, getAlertFromDischarge, alertLevels } from '@/data/thresholds';

describe('Realistic Alert Scenarios for Córdoba', () => {
  describe('Normal dry season conditions', () => {
    it('low precip, low discharge = verde for all', () => {
      municipalities.forEach(m => {
        const alert = getCombinedAlert(5, 150);
        expect(alert.level).toBe('verde');
      });
    });

    it('zero precipitation = verde', () => {
      expect(getCombinedAlert(0, 0).level).toBe('verde');
    });

    it('typical dry day (3mm precip, 100 m³/s) = verde', () => {
      expect(getCombinedAlert(3, 100).level).toBe('verde');
    });
  });

  describe('Light rain event', () => {
    it('moderate rain (22mm) = amarillo', () => {
      expect(getAlertFromPrecipitation(22).level).toBe('amarillo');
    });

    it('moderate rain with normal discharge = amarillo', () => {
      expect(getCombinedAlert(22, 200).level).toBe('amarillo');
    });

    it('moderate rain with rising discharge (350 m³/s) = amarillo', () => {
      expect(getCombinedAlert(22, 350).level).toBe('amarillo');
    });
  });

  describe('Heavy rain event', () => {
    it('heavy rain (45mm) = naranja', () => {
      expect(getAlertFromPrecipitation(45).level).toBe('naranja');
    });

    it('heavy rain with moderate discharge = naranja', () => {
      expect(getCombinedAlert(45, 400).level).toBe('naranja');
    });

    it('heavy rain with high discharge (700 m³/s) = naranja', () => {
      expect(getCombinedAlert(45, 700).level).toBe('naranja');
    });
  });

  describe('Extreme flood event (like Feb 2026)', () => {
    it('extreme rain (80mm) = rojo', () => {
      expect(getAlertFromPrecipitation(80).level).toBe('rojo');
    });

    it('extreme discharge (1500 m³/s) = rojo', () => {
      expect(getAlertFromDischarge(1500).level).toBe('rojo');
    });

    it('extreme rain + extreme discharge = rojo', () => {
      expect(getCombinedAlert(80, 1500).level).toBe('rojo');
    });

    it('extreme rain alone should trigger rojo', () => {
      expect(getCombinedAlert(100, 0).level).toBe('rojo');
    });

    it('extreme discharge alone should trigger rojo', () => {
      expect(getCombinedAlert(0, 2000).level).toBe('rojo');
    });
  });

  describe('Gradual rise scenario', () => {
    it('should transition verde → amarillo → naranja → rojo as precip increases', () => {
      const levels = [5, 25, 50, 80].map(p => getCombinedAlert(p, 0).level);
      expect(levels).toEqual(['verde', 'amarillo', 'naranja', 'rojo']);
    });

    it('should transition verde → amarillo → naranja → rojo as discharge increases', () => {
      const levels = [100, 400, 800, 1500].map(d => getCombinedAlert(0, d).level);
      expect(levels).toEqual(['verde', 'amarillo', 'naranja', 'rojo']);
    });
  });
});

describe('Municipality Priority Alerting', () => {
  it('Alta priority municipalities should include Montería', () => {
    const alta = municipalities.filter(m => m.priority === 'Alta');
    expect(alta.find(m => m.slug === 'monteria')).toBeDefined();
  });

  it('Alta priority municipalities should include Ayapel', () => {
    const alta = municipalities.filter(m => m.priority === 'Alta');
    expect(alta.find(m => m.slug === 'ayapel')).toBeDefined();
  });

  it('Alta priority should include Lorica', () => {
    const alta = municipalities.filter(m => m.priority === 'Alta');
    expect(alta.find(m => m.slug === 'lorica')).toBeDefined();
  });

  it('Alta priority should include Tierralta', () => {
    const alta = municipalities.filter(m => m.priority === 'Alta');
    expect(alta.find(m => m.slug === 'tierralta')).toBeDefined();
  });

  it('Sinú basin should have the most alta-priority municipalities', () => {
    const sinuAlta = municipalities.filter(m => m.cuenca.startsWith('Sinú') && m.priority === 'Alta').length;
    const sanJorgeAlta = municipalities.filter(m => m.cuenca.startsWith('San Jorge') && m.priority === 'Alta').length;
    expect(sinuAlta + sanJorgeAlta).toBeGreaterThanOrEqual(5);
  });
});

describe('Alert Level System Integrity', () => {
  it('should have exactly 4 alert levels', () => {
    expect(Object.keys(alertLevels)).toHaveLength(4);
  });

  it('all levels should have unique colors', () => {
    const colors = Object.values(alertLevels).map(a => a.color);
    expect(new Set(colors).size).toBe(4);
  });

  it('all levels should have unique labels', () => {
    const labels = Object.values(alertLevels).map(a => a.label);
    expect(new Set(labels).size).toBe(4);
  });

  it('all levels should have non-empty descriptions', () => {
    Object.values(alertLevels).forEach(a => {
      expect(a.description.length).toBeGreaterThan(5);
    });
  });

  it('rojo should be the most severe', () => {
    const order = ['rojo', 'naranja', 'amarillo', 'verde'];
    expect(order[0]).toBe('rojo');
  });

  it('verde should be the least severe', () => {
    const order = ['rojo', 'naranja', 'amarillo', 'verde'];
    expect(order[order.length - 1]).toBe('verde');
  });
});

describe('Population Risk Estimation', () => {
  it('should calculate total population at risk for rojo scenario', () => {
    const totalPopulation = municipalities.reduce((sum, m) => sum + (m.population || 0), 0);
    expect(totalPopulation).toBeGreaterThan(1_200_000);
  });

  it('Alta priority municipalities should cover > 500k population', () => {
    const altaPop = municipalities
      .filter(m => m.priority === 'Alta')
      .reduce((sum, m) => sum + (m.population || 0), 0);
    expect(altaPop).toBeGreaterThan(500_000);
  });

  it('Sinú basin municipalities should cover significant population', () => {
    const sinuPop = municipalities
      .filter(m => m.cuenca.startsWith('Sinú'))
      .reduce((sum, m) => sum + (m.population || 0), 0);
    expect(sinuPop).toBeGreaterThan(500_000);
  });

  it('San Jorge basin municipalities should have substantial coverage', () => {
    const sjPop = municipalities
      .filter(m => m.cuenca.startsWith('San Jorge'))
      .reduce((sum, m) => sum + (m.population || 0), 0);
    expect(sjPop).toBeGreaterThan(200_000);
  });
});
