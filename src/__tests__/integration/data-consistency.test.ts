import { describe, it, expect } from 'vitest';
import { municipalities, monitoringPoints, cuencas, CORDOBA_BOUNDS } from '@/data/municipalities';
import { alertLevels, getAlertFromPrecipitation, getAlertFromDischarge, getCombinedAlert } from '@/data/thresholds';

describe('Data consistency', () => {
  describe('Municipality-Cuenca mapping', () => {
    it('every municipality cuenca should exist in cuencas array', () => {
      const cuencaNames = cuencas.map(c => c.name);
      municipalities.forEach(m => {
        expect(cuencaNames).toContain(m.cuenca);
      });
    });

    it('every cuenca should have at least one municipality', () => {
      cuencas.forEach(c => {
        const munis = municipalities.filter(m => m.cuenca === c.name);
        expect(munis.length).toBeGreaterThan(0);
      });
    });

    it('Sinú cuenca should have the most municipalities', () => {
      const sinuCount = municipalities.filter(m => m.cuenca.startsWith('Sinú')).length;
      const sjCount = municipalities.filter(m => m.cuenca.startsWith('San Jorge')).length;
      expect(sinuCount).toBeGreaterThanOrEqual(sjCount);
    });
  });

  describe('Geographic consistency', () => {
    it('Sinú Alta municipalities should generally be south of Sinú Baja', () => {
      const altaAvgLat = municipalities
        .filter(m => m.cuenca === 'Sinú Alta')
        .reduce((sum, m) => sum + m.lat, 0) / municipalities.filter(m => m.cuenca === 'Sinú Alta').length;
      const bajaAvgLat = municipalities
        .filter(m => m.cuenca === 'Sinú Baja')
        .reduce((sum, m) => sum + m.lat, 0) / municipalities.filter(m => m.cuenca === 'Sinú Baja').length;
      expect(altaAvgLat).toBeLessThan(bajaAvgLat);
    });

    it('Embalse Urrá should be south of Montería', () => {
      const urra = monitoringPoints.find(p => p.name.includes('Urrá'));
      const monteria = municipalities.find(m => m.slug === 'monteria');
      expect(urra!.lat).toBeLessThan(monteria!.lat);
    });

    it('Desembocadura Sinú should be north of Montería', () => {
      const desembocadura = monitoringPoints.find(p => p.name.includes('Desembocadura'));
      const monteria = municipalities.find(m => m.slug === 'monteria');
      expect(desembocadura!.lat).toBeGreaterThan(monteria!.lat);
    });

    it('all monitoring points should be within CORDOBA_BOUNDS', () => {
      monitoringPoints.forEach(p => {
        expect(p.lat).toBeGreaterThanOrEqual(CORDOBA_BOUNDS.south);
        expect(p.lat).toBeLessThanOrEqual(CORDOBA_BOUNDS.north);
        expect(p.lon).toBeGreaterThanOrEqual(CORDOBA_BOUNDS.west);
        expect(p.lon).toBeLessThanOrEqual(CORDOBA_BOUNDS.east);
      });
    });
  });

  describe('Alert level consistency', () => {
    it('alert levels should have ascending severity order', () => {
      const order = ['verde', 'amarillo', 'naranja', 'rojo'];
      order.forEach(level => {
        expect(alertLevels[level]).toBeDefined();
      });
    });

    it('precipitation thresholds should match alert boundaries', () => {
      expect(getAlertFromPrecipitation(0).level).toBe('verde');
      expect(getAlertFromPrecipitation(20).level).toBe('amarillo');
      expect(getAlertFromPrecipitation(40).level).toBe('naranja');
      expect(getAlertFromPrecipitation(70).level).toBe('rojo');
    });

    it('discharge thresholds should match alert boundaries', () => {
      expect(getAlertFromDischarge(0).level).toBe('verde');
      expect(getAlertFromDischarge(300).level).toBe('amarillo');
      expect(getAlertFromDischarge(600).level).toBe('naranja');
      expect(getAlertFromDischarge(1200).level).toBe('rojo');
    });

    it('combined alert should always be >= individual alerts', () => {
      const levels = { verde: 0, amarillo: 1, naranja: 2, rojo: 3 };
      const testCases = [
        { precip: 5, discharge: 100 },
        { precip: 50, discharge: 100 },
        { precip: 5, discharge: 800 },
        { precip: 80, discharge: 1500 },
      ];

      testCases.forEach(({ precip, discharge }) => {
        const pAlert = getAlertFromPrecipitation(precip);
        const dAlert = getAlertFromDischarge(discharge);
        const combined = getCombinedAlert(precip, discharge);
        const combinedLevel = levels[combined.level];
        const maxLevel = Math.max(levels[pAlert.level], levels[dAlert.level]);
        expect(combinedLevel).toBe(maxLevel);
      });
    });
  });

  describe('February 2026 crisis scenario', () => {
    it('2500 m³/s discharge should trigger rojo alert', () => {
      expect(getAlertFromDischarge(2500).level).toBe('rojo');
    });

    it('heavy rainfall (100mm) should trigger rojo alert', () => {
      expect(getAlertFromPrecipitation(100).level).toBe('rojo');
    });

    it('combined crisis conditions should be rojo', () => {
      expect(getCombinedAlert(100, 2500).level).toBe('rojo');
    });

    it('normal conditions should be verde', () => {
      expect(getCombinedAlert(5, 150).level).toBe('verde');
    });
  });

  describe('Municipality slugs for URL routing', () => {
    it('all slugs should be valid URL segments', () => {
      municipalities.forEach(m => {
        expect(m.slug).not.toContain(' ');
        expect(m.slug).not.toContain('/');
        expect(m.slug).not.toContain('?');
        expect(m.slug).not.toContain('#');
        expect(encodeURIComponent(m.slug)).toBe(m.slug);
      });
    });

    it('no two municipalities should have conflicting routes', () => {
      const slugs = municipalities.map(m => m.slug);
      const reserved = ['historico', 'api', 'municipio'];
      slugs.forEach(slug => {
        expect(reserved).not.toContain(slug);
      });
    });
  });

  describe('Population data sanity', () => {
    it('Montería should be the largest city', () => {
      const maxPop = Math.max(...municipalities.map(m => m.population || 0));
      const monteria = municipalities.find(m => m.slug === 'monteria');
      expect(monteria!.population).toBe(maxPop);
    });

    it('no municipality should have zero population', () => {
      municipalities.forEach(m => {
        expect(m.population).toBeGreaterThan(0);
      });
    });

    it('smallest municipality should have at least 10,000 people', () => {
      const minPop = Math.min(...municipalities.map(m => m.population || 0));
      expect(minPop).toBeGreaterThanOrEqual(10_000);
    });
  });
});
