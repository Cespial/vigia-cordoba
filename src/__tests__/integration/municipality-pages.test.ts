import { describe, it, expect } from 'vitest';
import { municipalities } from '@/data/municipalities';

describe('Municipality Detail Pages — Route Validation', () => {
  it('all 30 municipalities should have valid slugs for routing', () => {
    expect(municipalities).toHaveLength(30);
    municipalities.forEach(m => {
      expect(m.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it('should have unique slugs', () => {
    const slugs = municipalities.map(m => m.slug);
    expect(new Set(slugs).size).toBe(municipalities.length);
  });

  it('should have unique names', () => {
    const names = municipalities.map(m => m.name);
    expect(new Set(names).size).toBe(municipalities.length);
  });

  it('monteria slug should be "monteria"', () => {
    const m = municipalities.find(m => m.name === 'Montería');
    expect(m?.slug).toBe('monteria');
  });

  it('lorica slug should be "lorica"', () => {
    const m = municipalities.find(m => m.name === 'Lorica');
    expect(m?.slug).toBe('lorica');
  });

  it('tierralta slug should be "tierralta"', () => {
    const m = municipalities.find(m => m.name === 'Tierralta');
    expect(m?.slug).toBe('tierralta');
  });

  it('san-pelayo slug should contain hyphen', () => {
    const m = municipalities.find(m => m.name === 'San Pelayo');
    expect(m?.slug).toContain('-');
  });

  it('san-bernardo-del-viento should be a valid slug', () => {
    const m = municipalities.find(m => m.name === 'San Bernardo del Viento');
    expect(m?.slug).toBe('san-bernardo-del-viento');
  });

  it('san-jose-de-ure should be a valid slug', () => {
    const m = municipalities.find(m => m.name === 'San José de Uré');
    expect(m?.slug).toBe('san-jose-de-ure');
  });

  it('cienaga-de-oro should be a valid slug', () => {
    const m = municipalities.find(m => m.name === 'Ciénaga de Oro');
    expect(m?.slug).toBe('cienaga-de-oro');
  });
});

describe('Municipality Detail Pages — Data Availability', () => {
  it('each municipality should have coordinates for weather fetch', () => {
    municipalities.forEach(m => {
      expect(m.lat).toBeGreaterThan(0);
      expect(m.lon).toBeLessThan(0);
    });
  });

  it('each municipality should have a cuenca for display', () => {
    municipalities.forEach(m => {
      expect(m.cuenca.length).toBeGreaterThan(0);
    });
  });

  it('each municipality should have a population for display', () => {
    municipalities.forEach(m => {
      expect(m.population).toBeDefined();
      expect(m.population).toBeGreaterThan(0);
    });
  });

  it('each municipality should have a priority', () => {
    municipalities.forEach(m => {
      expect(['Alta', 'Media', 'Baja']).toContain(m.priority);
    });
  });
});

describe('Municipality Detail Pages — Geographic Consistency', () => {
  it('Sinú Alta municipalities should be southern', () => {
    const sinuAlta = municipalities.filter(m => m.cuenca === 'Sinú Alta');
    const sinuBaja = municipalities.filter(m => m.cuenca === 'Sinú Baja');
    const avgAltaLat = sinuAlta.reduce((s, m) => s + m.lat, 0) / sinuAlta.length;
    const avgBajaLat = sinuBaja.reduce((s, m) => s + m.lat, 0) / sinuBaja.length;
    expect(avgAltaLat).toBeLessThan(avgBajaLat);
  });

  it('Sinú Baja municipalities should be near the coast', () => {
    const sinuBaja = municipalities.filter(m => m.cuenca === 'Sinú Baja');
    const maxLat = Math.max(...sinuBaja.map(m => m.lat));
    expect(maxLat).toBeGreaterThan(9.0);
  });

  it('Canalete municipalities should be western', () => {
    const canalete = municipalities.filter(m => m.cuenca === 'Canalete');
    const avgLon = canalete.reduce((s, m) => s + m.lon, 0) / canalete.length;
    expect(avgLon).toBeLessThan(-76.0);
  });

  it('San Jorge municipalities should be eastern', () => {
    const sanJorge = municipalities.filter(m => m.cuenca.startsWith('San Jorge'));
    const avgLon = sanJorge.reduce((s, m) => s + m.lon, 0) / sanJorge.length;
    const sinuAvgLon = municipalities
      .filter(m => m.cuenca.startsWith('Sinú'))
      .reduce((s, m) => s + m.lon, 0) / municipalities.filter(m => m.cuenca.startsWith('Sinú')).length;
    expect(avgLon).toBeGreaterThan(sinuAvgLon);
  });
});

describe('Municipality Search', () => {
  it('should find municipality by lowercase name search', () => {
    const search = 'montería';
    const found = municipalities.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
    expect(found).toHaveLength(1);
    expect(found[0].slug).toBe('monteria');
  });

  it('should find municipality by partial name', () => {
    const found = municipalities.filter(m => m.name.toLowerCase().includes('san'));
    expect(found.length).toBeGreaterThan(2);
  });

  it('should not find non-existent municipality', () => {
    const found = municipalities.filter(m => m.name.toLowerCase().includes('bogota'));
    expect(found).toHaveLength(0);
  });

  it('should find by cuenca filter', () => {
    const sinuMedia = municipalities.filter(m => m.cuenca === 'Sinú Media');
    expect(sinuMedia.length).toBeGreaterThan(0);
    sinuMedia.forEach(m => expect(m.cuenca).toBe('Sinú Media'));
  });

  it('should sort by alert level order', () => {
    const order = { rojo: 0, naranja: 1, amarillo: 2, verde: 3 };
    const mockAlerts = municipalities.map((m, i) => ({
      municipality: m,
      level: (['rojo', 'verde', 'amarillo', 'naranja'] as const)[i % 4],
    }));
    const sorted = [...mockAlerts].sort((a, b) => order[a.level] - order[b.level]);
    expect(order[sorted[0].level]).toBeLessThanOrEqual(order[sorted[sorted.length - 1].level]);
  });
});
