import { describe, it, expect } from 'vitest';
import { municipalities, monitoringPoints, cuencas, CORDOBA_BOUNDS } from '@/data/municipalities';

describe('municipalities data', () => {
  it('should have exactly 30 municipalities', () => {
    expect(municipalities).toHaveLength(30);
  });

  it('should have unique slugs', () => {
    const slugs = municipalities.map(m => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('should have unique names', () => {
    const names = municipalities.map(m => m.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every municipality should have valid coordinates', () => {
    municipalities.forEach(m => {
      expect(m.lat).toBeGreaterThan(7);
      expect(m.lat).toBeLessThan(10);
      expect(m.lon).toBeGreaterThan(-77);
      expect(m.lon).toBeLessThan(-74);
    });
  });

  it('every municipality should have a valid cuenca', () => {
    const validCuencas = ['Sinú Alta', 'Sinú Media', 'Sinú Baja', 'San Jorge Alta', 'San Jorge Baja', 'Canalete'];
    municipalities.forEach(m => {
      expect(validCuencas).toContain(m.cuenca);
    });
  });

  it('every municipality should have a valid priority', () => {
    municipalities.forEach(m => {
      expect(['Alta', 'Media', 'Baja']).toContain(m.priority);
    });
  });

  it('every municipality should have a slug in lowercase with hyphens', () => {
    municipalities.forEach(m => {
      expect(m.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it('should have population for every municipality', () => {
    municipalities.forEach(m => {
      expect(m.population).toBeDefined();
      expect(m.population).toBeGreaterThan(0);
    });
  });

  it('Montería should be the most populated', () => {
    const monteria = municipalities.find(m => m.slug === 'monteria');
    expect(monteria).toBeDefined();
    expect(monteria!.population).toBeGreaterThan(400_000);
  });

  it('should have Montería in Sinú Media', () => {
    const monteria = municipalities.find(m => m.slug === 'monteria');
    expect(monteria?.cuenca).toBe('Sinú Media');
  });

  it('should have Tierralta in Sinú Alta', () => {
    const tierralta = municipalities.find(m => m.slug === 'tierralta');
    expect(tierralta?.cuenca).toBe('Sinú Alta');
  });

  it('should have Lorica in Sinú Baja', () => {
    const lorica = municipalities.find(m => m.slug === 'lorica');
    expect(lorica?.cuenca).toBe('Sinú Baja');
  });

  it('should have Ayapel in San Jorge Baja', () => {
    const ayapel = municipalities.find(m => m.slug === 'ayapel');
    expect(ayapel?.cuenca).toBe('San Jorge Baja');
  });

  it('should have Montelíbano in San Jorge Alta', () => {
    const montelibano = municipalities.find(m => m.slug === 'montelibano');
    expect(montelibano?.cuenca).toBe('San Jorge Alta');
  });

  it('should have at least 5 Alta priority municipalities', () => {
    const alta = municipalities.filter(m => m.priority === 'Alta');
    expect(alta.length).toBeGreaterThanOrEqual(5);
  });

  it('all coordinates should be within CORDOBA_BOUNDS', () => {
    municipalities.forEach(m => {
      expect(m.lat).toBeGreaterThanOrEqual(CORDOBA_BOUNDS.south);
      expect(m.lat).toBeLessThanOrEqual(CORDOBA_BOUNDS.north);
      expect(m.lon).toBeGreaterThanOrEqual(CORDOBA_BOUNDS.west);
      expect(m.lon).toBeLessThanOrEqual(CORDOBA_BOUNDS.east);
    });
  });

  it('total population should be reasonable for Córdoba department', () => {
    const total = municipalities.reduce((sum, m) => sum + (m.population || 0), 0);
    expect(total).toBeGreaterThan(1_000_000);
    expect(total).toBeLessThan(3_000_000);
  });

  it('should have municipalities from all cuencas', () => {
    const cuencasUsed = new Set(municipalities.map(m => m.cuenca));
    expect(cuencasUsed.size).toBe(6);
  });
});

describe('monitoringPoints', () => {
  it('should have at least 4 monitoring points', () => {
    expect(monitoringPoints.length).toBeGreaterThanOrEqual(4);
  });

  it('should include Embalse Urrá I', () => {
    const urra = monitoringPoints.find(p => p.name.includes('Urrá'));
    expect(urra).toBeDefined();
    expect(urra!.type).toBe('hidroelectrica');
  });

  it('should include Cotocá Abajo', () => {
    const cotoca = monitoringPoints.find(p => p.name.includes('Cotocá'));
    expect(cotoca).toBeDefined();
    expect(cotoca!.type).toBe('estacion');
  });

  it('all monitoring points should have valid coordinates', () => {
    monitoringPoints.forEach(p => {
      expect(p.lat).toBeGreaterThan(7);
      expect(p.lat).toBeLessThan(10);
      expect(p.lon).toBeGreaterThan(-77);
      expect(p.lon).toBeLessThan(-74);
    });
  });

  it('all monitoring points should have a valid type', () => {
    monitoringPoints.forEach(p => {
      expect(['hidroelectrica', 'estacion', 'desembocadura']).toContain(p.type);
    });
  });
});

describe('cuencas', () => {
  it('should have 6 cuencas', () => {
    expect(cuencas).toHaveLength(6);
  });

  it('should have unique names', () => {
    const names = cuencas.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('should have valid hex colors', () => {
    cuencas.forEach(c => {
      expect(c.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('should include all Sinú sub-basins', () => {
    const sinuCuencas = cuencas.filter(c => c.name.startsWith('Sinú'));
    expect(sinuCuencas).toHaveLength(3);
  });

  it('should include all San Jorge sub-basins', () => {
    const sjCuencas = cuencas.filter(c => c.name.startsWith('San Jorge'));
    expect(sjCuencas).toHaveLength(2);
  });

  it('should include Canalete', () => {
    const canalete = cuencas.find(c => c.name === 'Canalete');
    expect(canalete).toBeDefined();
  });
});

describe('CORDOBA_BOUNDS', () => {
  it('should have valid bounds', () => {
    expect(CORDOBA_BOUNDS.north).toBeGreaterThan(CORDOBA_BOUNDS.south);
    expect(CORDOBA_BOUNDS.east).toBeGreaterThan(CORDOBA_BOUNDS.west);
  });

  it('center should be within bounds', () => {
    expect(CORDOBA_BOUNDS.center.lat).toBeGreaterThan(CORDOBA_BOUNDS.south);
    expect(CORDOBA_BOUNDS.center.lat).toBeLessThan(CORDOBA_BOUNDS.north);
    expect(CORDOBA_BOUNDS.center.lon).toBeGreaterThan(CORDOBA_BOUNDS.west);
    expect(CORDOBA_BOUNDS.center.lon).toBeLessThan(CORDOBA_BOUNDS.east);
  });

  it('should cover approximately the right area for Córdoba', () => {
    const latRange = CORDOBA_BOUNDS.north - CORDOBA_BOUNDS.south;
    const lonRange = CORDOBA_BOUNDS.east - CORDOBA_BOUNDS.west;
    expect(latRange).toBeGreaterThan(1.5);
    expect(latRange).toBeLessThan(3);
    expect(lonRange).toBeGreaterThan(1.5);
    expect(lonRange).toBeLessThan(3);
  });
});
