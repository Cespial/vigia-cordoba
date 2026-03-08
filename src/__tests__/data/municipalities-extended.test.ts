import { describe, it, expect } from 'vitest';
import { municipalities, monitoringPoints, cuencas, CORDOBA_BOUNDS } from '@/data/municipalities';

describe('Municipalities — Geographic Validation', () => {
  it('should have all municipalities within Córdoba bounds', () => {
    municipalities.forEach(m => {
      expect(m.lat).toBeGreaterThanOrEqual(CORDOBA_BOUNDS.south);
      expect(m.lat).toBeLessThanOrEqual(CORDOBA_BOUNDS.north);
      expect(m.lon).toBeGreaterThanOrEqual(CORDOBA_BOUNDS.west);
      expect(m.lon).toBeLessThanOrEqual(CORDOBA_BOUNDS.east);
    });
  });

  it('Montería should be close to 8.75°N', () => {
    const m = municipalities.find(m => m.slug === 'monteria');
    expect(m).toBeDefined();
    expect(Math.abs(m!.lat - 8.75)).toBeLessThan(0.1);
  });

  it('Lorica should be north of Montería', () => {
    const lorica = municipalities.find(m => m.slug === 'lorica');
    const monteria = municipalities.find(m => m.slug === 'monteria');
    expect(lorica!.lat).toBeGreaterThan(monteria!.lat);
  });

  it('Tierralta should be south of Montería', () => {
    const tierralta = municipalities.find(m => m.slug === 'tierralta');
    const monteria = municipalities.find(m => m.slug === 'monteria');
    expect(tierralta!.lat).toBeLessThan(monteria!.lat);
  });

  it('all latitudes should be positive (northern hemisphere)', () => {
    municipalities.forEach(m => {
      expect(m.lat).toBeGreaterThan(0);
    });
  });

  it('all longitudes should be negative (western hemisphere)', () => {
    municipalities.forEach(m => {
      expect(m.lon).toBeLessThan(0);
    });
  });

  it('no two municipalities should have the exact same coordinates', () => {
    const coords = municipalities.map(m => `${m.lat},${m.lon}`);
    const unique = new Set(coords);
    expect(unique.size).toBe(municipalities.length);
  });

  it('monitoring points should be within Córdoba bounds', () => {
    monitoringPoints.forEach(p => {
      expect(p.lat).toBeGreaterThanOrEqual(CORDOBA_BOUNDS.south - 0.5);
      expect(p.lat).toBeLessThanOrEqual(CORDOBA_BOUNDS.north + 0.5);
      expect(p.lon).toBeGreaterThanOrEqual(CORDOBA_BOUNDS.west - 0.5);
      expect(p.lon).toBeLessThanOrEqual(CORDOBA_BOUNDS.east + 0.5);
    });
  });
});

describe('Municipalities — Population Data', () => {
  it('Montería should have the highest population', () => {
    const sorted = [...municipalities].sort((a, b) => (b.population || 0) - (a.population || 0));
    expect(sorted[0].slug).toBe('monteria');
  });

  it('total population should exceed 1 million', () => {
    const total = municipalities.reduce((sum, m) => sum + (m.population || 0), 0);
    expect(total).toBeGreaterThan(1_000_000);
  });

  it('Alta priority municipalities should have >40k population', () => {
    const alta = municipalities.filter(m => m.priority === 'Alta');
    alta.forEach(m => {
      expect(m.population).toBeGreaterThanOrEqual(40_000);
    });
  });

  it('all municipalities should have population > 0', () => {
    municipalities.forEach(m => {
      expect(m.population).toBeDefined();
      expect(m.population).toBeGreaterThan(0);
    });
  });

  it('no municipality should exceed 1 million population', () => {
    municipalities.forEach(m => {
      expect(m.population).toBeLessThan(1_000_000);
    });
  });
});

describe('Municipalities — Cuenca Distribution', () => {
  it('every municipality cuenca should be in the cuencas list', () => {
    const cuencaNames = cuencas.map(c => c.name);
    municipalities.forEach(m => {
      expect(cuencaNames).toContain(m.cuenca);
    });
  });

  it('Sinú cuencas should have the most municipalities', () => {
    const sinuCount = municipalities.filter(m => m.cuenca.startsWith('Sinú')).length;
    const sanJorgeCount = municipalities.filter(m => m.cuenca.startsWith('San Jorge')).length;
    expect(sinuCount).toBeGreaterThanOrEqual(sanJorgeCount);
  });

  it('each cuenca should have at least one municipality', () => {
    cuencas.forEach(c => {
      const count = municipalities.filter(m => m.cuenca === c.name).length;
      expect(count).toBeGreaterThan(0);
    });
  });

  it('cuencas should have unique colors', () => {
    const colors = cuencas.map(c => c.color);
    const unique = new Set(colors);
    expect(unique.size).toBe(cuencas.length);
  });

  it('cuenca colors should be valid hex colors', () => {
    cuencas.forEach(c => {
      expect(c.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});

describe('Municipalities — Priority Distribution', () => {
  it('should have Alta, Media, and Baja priorities', () => {
    const priorities = new Set(municipalities.map(m => m.priority));
    expect(priorities.has('Alta')).toBe(true);
    expect(priorities.has('Media')).toBe(true);
    expect(priorities.has('Baja')).toBe(true);
  });

  it('Alta priority count should be between 5 and 10', () => {
    const count = municipalities.filter(m => m.priority === 'Alta').length;
    expect(count).toBeGreaterThanOrEqual(5);
    expect(count).toBeLessThanOrEqual(10);
  });

  it('Baja priority should have at least as many municipalities as Alta', () => {
    const alta = municipalities.filter(m => m.priority === 'Alta').length;
    const baja = municipalities.filter(m => m.priority === 'Baja').length;
    expect(baja).toBeGreaterThanOrEqual(alta);
  });
});

describe('Municipalities — Slug Validation', () => {
  it('all slugs should be lowercase', () => {
    municipalities.forEach(m => {
      expect(m.slug).toBe(m.slug.toLowerCase());
    });
  });

  it('all slugs should be URL-safe', () => {
    municipalities.forEach(m => {
      expect(m.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it('slugs should not start or end with a hyphen', () => {
    municipalities.forEach(m => {
      expect(m.slug).not.toMatch(/^-/);
      expect(m.slug).not.toMatch(/-$/);
    });
  });

  it('slugs should not have consecutive hyphens', () => {
    municipalities.forEach(m => {
      expect(m.slug).not.toContain('--');
    });
  });
});

describe('Monitoring Points', () => {
  it('Urrá I should be a hidroelectrica', () => {
    const urra = monitoringPoints.find(p => p.name.includes('Urrá'));
    expect(urra).toBeDefined();
    expect(urra!.type).toBe('hidroelectrica');
  });

  it('should have at least one estacion type', () => {
    const estaciones = monitoringPoints.filter(p => p.type === 'estacion');
    expect(estaciones.length).toBeGreaterThan(0);
  });

  it('should have exactly one desembocadura', () => {
    const desembocaduras = monitoringPoints.filter(p => p.type === 'desembocadura');
    expect(desembocaduras.length).toBe(1);
  });

  it('desembocadura should be the northernmost point', () => {
    const desembocadura = monitoringPoints.find(p => p.type === 'desembocadura');
    monitoringPoints.forEach(p => {
      if (p.type !== 'desembocadura') {
        expect(desembocadura!.lat).toBeGreaterThanOrEqual(p.lat);
      }
    });
  });

  it('Urrá I should be the southernmost monitoring point', () => {
    const urra = monitoringPoints.find(p => p.name.includes('Urrá'));
    monitoringPoints.forEach(p => {
      if (!p.name.includes('Urrá')) {
        expect(urra!.lat).toBeLessThanOrEqual(p.lat);
      }
    });
  });
});

describe('CORDOBA_BOUNDS', () => {
  it('center should be within bounds', () => {
    expect(CORDOBA_BOUNDS.center.lat).toBeGreaterThan(CORDOBA_BOUNDS.south);
    expect(CORDOBA_BOUNDS.center.lat).toBeLessThan(CORDOBA_BOUNDS.north);
    expect(CORDOBA_BOUNDS.center.lon).toBeGreaterThan(CORDOBA_BOUNDS.west);
    expect(CORDOBA_BOUNDS.center.lon).toBeLessThan(CORDOBA_BOUNDS.east);
  });

  it('bounds should span roughly 2 degrees latitude', () => {
    const span = CORDOBA_BOUNDS.north - CORDOBA_BOUNDS.south;
    expect(span).toBeGreaterThan(1.5);
    expect(span).toBeLessThan(3);
  });

  it('bounds should span roughly 1.7 degrees longitude', () => {
    const span = CORDOBA_BOUNDS.east - CORDOBA_BOUNDS.west;
    expect(span).toBeGreaterThan(1);
    expect(span).toBeLessThan(3);
  });
});
