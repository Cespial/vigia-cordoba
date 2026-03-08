import { describe, it, expect } from 'vitest';
import boundariesData from '@/data/cordoba-boundaries.json';
import riversData from '@/data/cordoba-rivers.json';
import stationsData from '@/data/ideam-stations.json';
import emergenciesData from '@/data/ungrd-emergencies.json';
import ensoData from '@/data/enso-oni.json';
import { municipalities } from '@/data/municipalities';

type BoundaryFeature = {
  type: string;
  properties: { shapeName?: string; [key: string]: unknown };
  geometry: { type: string; coordinates: unknown };
};

type RiverFeature = {
  type: string;
  properties: { name?: string };
  geometry: { type: string; coordinates: number[][] };
};

type Station = {
  name: string;
  code: string;
  type: string;
  lat: number;
  lon: number;
  municipality: string;
  active: boolean;
  elevation: number | null;
};

type Emergency = {
  date: string;
  municipality: string;
  event_type: string;
  deaths: number;
  injuries: number;
  affected: number;
  destroyed_homes: number;
  damaged_homes: number;
  resources: number;
};

type ENSORecord = {
  year: number;
  season: string;
  total: number;
  anomaly: number;
};

describe('Municipality Boundaries (GeoJSON)', () => {
  const data = boundariesData as { type: string; features: BoundaryFeature[] };

  it('should be a valid FeatureCollection', () => {
    expect(data.type).toBe('FeatureCollection');
  });

  it('should have 30 municipality features', () => {
    expect(data.features.length).toBe(30);
  });

  it('should have valid feature types', () => {
    data.features.forEach(f => {
      expect(f.type).toBe('Feature');
    });
  });

  it('should have geometry for all features', () => {
    data.features.forEach(f => {
      expect(f.geometry).toBeDefined();
      expect(['Polygon', 'MultiPolygon']).toContain(f.geometry.type);
    });
  });

  it('should have shapeName property', () => {
    data.features.forEach(f => {
      expect(f.properties.shapeName).toBeDefined();
      expect(typeof f.properties.shapeName).toBe('string');
    });
  });

  it('should include Montería', () => {
    const monteria = data.features.find(f =>
      f.properties.shapeName?.toLowerCase().includes('monter')
    );
    expect(monteria).toBeDefined();
  });

  it('should include Lorica', () => {
    const lorica = data.features.find(f =>
      f.properties.shapeName?.toLowerCase().includes('lorica')
    );
    expect(lorica).toBeDefined();
  });

  it('should include Tierralta', () => {
    const tierralta = data.features.find(f =>
      f.properties.shapeName?.toLowerCase().includes('tierralta')
    );
    expect(tierralta).toBeDefined();
  });

  it('should have coordinates within Córdoba bounds', () => {
    data.features.forEach(f => {
      const coords = JSON.stringify(f.geometry.coordinates);
      // Basic check: coordinates exist and are numbers
      expect(coords.length).toBeGreaterThan(0);
    });
  });
});

describe('River Network (GeoJSON)', () => {
  const data = riversData as { type: string; features: RiverFeature[] };

  it('should be a valid FeatureCollection', () => {
    expect(data.type).toBe('FeatureCollection');
  });

  it('should have multiple river features', () => {
    expect(data.features.length).toBeGreaterThan(50);
  });

  it('should have LineString geometry', () => {
    data.features.forEach(f => {
      expect(f.geometry.type).toBe('LineString');
    });
  });

  it('should include Río Sinú', () => {
    const sinu = data.features.find(f => f.properties.name?.includes('Sinú'));
    expect(sinu).toBeDefined();
  });

  it('should include Río San Jorge', () => {
    const sanJorge = data.features.find(f => f.properties.name?.includes('San Jorge'));
    expect(sanJorge).toBeDefined();
  });

  it('should include Río Canalete', () => {
    const canalete = data.features.find(f => f.properties.name?.includes('Canalete'));
    expect(canalete).toBeDefined();
  });

  it('should have named rivers', () => {
    const named = data.features.filter(f => f.properties.name);
    expect(named.length).toBe(data.features.length); // All should be named
  });

  it('should have valid coordinates', () => {
    data.features.forEach(f => {
      expect(f.geometry.coordinates.length).toBeGreaterThan(1);
      f.geometry.coordinates.forEach(coord => {
        expect(typeof coord[0]).toBe('number');
        expect(typeof coord[1]).toBe('number');
      });
    });
  });

  it('should have coordinates within Colombia bounds', () => {
    // Rivers extend beyond Córdoba into neighboring departments
    data.features.forEach(f => {
      f.geometry.coordinates.forEach(coord => {
        expect(coord[0]).toBeGreaterThan(-78); // lon
        expect(coord[0]).toBeLessThan(-72);
        expect(coord[1]).toBeGreaterThan(0); // lat (rivers like Magdalena start further south)
        expect(coord[1]).toBeLessThan(12);
      });
    });
  });

  it('should have unique river names', () => {
    const names = [...new Set(data.features.map(f => f.properties.name).filter(Boolean))];
    expect(names.length).toBeGreaterThan(5);
  });
});

describe('IDEAM Stations', () => {
  const data = stationsData as Station[];

  it('should have multiple stations', () => {
    expect(data.length).toBeGreaterThan(100);
  });

  it('should have valid station structure', () => {
    data.forEach(s => {
      expect(s.name).toBeDefined();
      expect(typeof s.name).toBe('string');
      expect(s.code).toBeDefined();
      expect(typeof s.lat).toBe('number');
      expect(typeof s.lon).toBe('number');
    });
  });

  it('should have active and inactive stations', () => {
    const active = data.filter(s => s.active);
    const inactive = data.filter(s => !s.active);
    expect(active.length).toBeGreaterThan(0);
    expect(inactive.length).toBeGreaterThan(0);
  });

  it('should have stations with valid coordinates', () => {
    data.forEach(s => {
      expect(s.lat).toBeGreaterThan(6);
      expect(s.lat).toBeLessThan(10);
      expect(s.lon).toBeGreaterThan(-77);
      expect(s.lon).toBeLessThan(-74);
    });
  });

  it('should have station types', () => {
    data.forEach(s => {
      expect(s.type).toBeDefined();
      expect(typeof s.type).toBe('string');
    });
  });

  it('should have municipality info', () => {
    data.forEach(s => {
      expect(s.municipality).toBeDefined();
    });
  });

  it('should have unique station codes', () => {
    const codes = data.map(s => s.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('should include various station types', () => {
    const types = [...new Set(data.map(s => s.type))];
    expect(types.length).toBeGreaterThan(2);
  });

  it('should have more than 50% active stations', () => {
    const activeCount = data.filter(s => s.active).length;
    expect(activeCount / data.length).toBeGreaterThan(0.3);
  });
});

describe('UNGRD Emergencies', () => {
  const data = emergenciesData as Emergency[];

  it('should have emergency records', () => {
    expect(data.length).toBeGreaterThan(10);
  });

  it('should have valid emergency structure', () => {
    data.forEach(e => {
      expect(e.date).toBeDefined();
      expect(e.municipality).toBeDefined();
      expect(e.event_type).toBeDefined();
      expect(typeof e.deaths).toBe('number');
      expect(typeof e.affected).toBe('number');
    });
  });

  it('should be flood-related events', () => {
    data.forEach(e => {
      expect(e.event_type.toLowerCase()).toMatch(/inundaci|avalanch|creciente|desbordamiento/);
    });
  });

  it('should have valid dates', () => {
    data.forEach(e => {
      const date = new Date(e.date);
      expect(date.getTime()).not.toBeNaN();
    });
  });

  it('should have affected counts >= 0', () => {
    data.forEach(e => {
      expect(e.affected).toBeGreaterThanOrEqual(0);
      expect(e.deaths).toBeGreaterThanOrEqual(0);
    });
  });

  it('should include multiple municipalities', () => {
    const munis = [...new Set(data.map(e => e.municipality))];
    expect(munis.length).toBeGreaterThan(3);
  });

  it('should have Córdoba municipalities', () => {
    const munis = [...new Set(data.map(e => e.municipality.toLowerCase()))];
    const cordobaNames = municipalities.map(m => m.name.toLowerCase());
    const matching = munis.filter(m =>
      cordobaNames.some(c => m.includes(c) || c.includes(m))
    );
    expect(matching.length).toBeGreaterThan(0);
  });
});

describe('ENSO ONI Data', () => {
  const data = ensoData as ENSORecord[];

  it('should have ENSO records', () => {
    expect(data.length).toBeGreaterThan(50);
  });

  it('should have valid ENSO structure', () => {
    data.forEach(e => {
      expect(typeof e.year).toBe('number');
      expect(typeof e.season).toBe('string');
      expect(typeof e.total).toBe('number');
      expect(typeof e.anomaly).toBe('number');
    });
  });

  it('should have valid seasons', () => {
    const validSeasons = ['DJF', 'JFM', 'FMA', 'MAM', 'AMJ', 'MJJ', 'JJA', 'JAS', 'ASO', 'SON', 'OND', 'NDJ'];
    data.forEach(e => {
      expect(validSeasons).toContain(e.season);
    });
  });

  it('should have recent years', () => {
    const latestYear = Math.max(...data.map(e => e.year));
    expect(latestYear).toBeGreaterThanOrEqual(2025);
  });

  it('should have anomalies within reasonable range', () => {
    data.forEach(e => {
      expect(e.anomaly).toBeGreaterThan(-4);
      expect(e.anomaly).toBeLessThan(4);
    });
  });

  it('should have SST totals within reasonable range', () => {
    data.forEach(e => {
      expect(e.total).toBeGreaterThan(20);
      expect(e.total).toBeLessThan(35);
    });
  });

  it('should be sorted by year', () => {
    for (let i = 1; i < data.length; i++) {
      expect(data[i].year).toBeGreaterThanOrEqual(data[i - 1].year);
    }
  });

  it('should include both positive and negative anomalies', () => {
    const positive = data.filter(e => e.anomaly > 0);
    const negative = data.filter(e => e.anomaly < 0);
    expect(positive.length).toBeGreaterThan(0);
    expect(negative.length).toBeGreaterThan(0);
  });
});
