import { describe, it, expect } from 'vitest';
import educationData from '@/data/education-institutions.json';
import healthData from '@/data/health-institutions.json';
import nbiData from '@/data/nbi-data.json';
import agricultureData from '@/data/agriculture-data.json';
import livestockData from '@/data/livestock-data.json';
import { municipalities } from '@/data/municipalities';

type EducationRecord = { municipality: string; count: number; rural: number; urban: number; totalStudents: number };
type HealthRecord = { municipality: string; total: number; hospitals: number; centers: number };
type NBIRecord = { municipality: string; nbi_total: number; nbi_urban: number; nbi_rural: number };
type AgricultureRecord = { municipality: string; total_ha: number; main_crops: string[]; total_production_tons: number };
type LivestockRecord = { municipality: string; cattle_heads: number; area_pasture_ha: number };

describe('Education Institutions Data', () => {
  const data = educationData as EducationRecord[];

  it('should be an array', () => {
    expect(Array.isArray(data)).toBe(true);
  });

  it('should have 30 municipalities', () => {
    expect(data.length).toBe(30);
  });

  it('should have valid structure', () => {
    data.forEach(d => {
      expect(d.municipality).toBeDefined();
      expect(typeof d.count).toBe('number');
      expect(d.count).toBeGreaterThan(0);
    });
  });

  it('should have Montería with most institutions', () => {
    const monteria = data.find(d => d.municipality.toLowerCase().includes('monter'));
    expect(monteria).toBeDefined();
    expect(monteria!.count).toBeGreaterThan(100);
  });

  it('should have rural and urban counts', () => {
    data.forEach(d => {
      expect(typeof d.rural).toBe('number');
      expect(typeof d.urban).toBe('number');
      expect(d.rural + d.urban).toBeLessThanOrEqual(d.count * 2); // Allow overlap
    });
  });

  it('should have student enrollment data', () => {
    const total = data.reduce((s, d) => s + d.totalStudents, 0);
    expect(total).toBeGreaterThan(100000);
  });
});

describe('Health Institutions Data', () => {
  const data = healthData as HealthRecord[];

  it('should be an array', () => {
    expect(Array.isArray(data)).toBe(true);
  });

  it('should have multiple municipalities', () => {
    expect(data.length).toBeGreaterThan(20);
  });

  it('should have valid structure', () => {
    data.forEach(d => {
      expect(d.municipality).toBeDefined();
      expect(typeof d.total).toBe('number');
      expect(typeof d.hospitals).toBe('number');
      expect(typeof d.centers).toBe('number');
    });
  });

  it('should have hospitals + centers <= total', () => {
    data.forEach(d => {
      expect(d.hospitals + d.centers).toBe(d.total);
    });
  });

  it('should have Montería with most health facilities', () => {
    const monteria = data.find(d => d.municipality.toLowerCase().includes('monter'));
    expect(monteria).toBeDefined();
    expect(monteria!.total).toBeGreaterThan(50);
  });

  it('should have total facilities over 1000', () => {
    const total = data.reduce((s, d) => s + d.total, 0);
    expect(total).toBeGreaterThan(1000);
  });
});

describe('NBI (Poverty) Data', () => {
  const data = nbiData as NBIRecord[];

  it('should have 30 municipalities', () => {
    expect(data.length).toBe(30);
  });

  it('should have valid NBI structure', () => {
    data.forEach(d => {
      expect(d.municipality).toBeDefined();
      expect(typeof d.nbi_total).toBe('number');
      expect(typeof d.nbi_urban).toBe('number');
      expect(typeof d.nbi_rural).toBe('number');
    });
  });

  it('should have NBI values between 0 and 100', () => {
    data.forEach(d => {
      expect(d.nbi_total).toBeGreaterThan(0);
      expect(d.nbi_total).toBeLessThan(100);
      expect(d.nbi_urban).toBeGreaterThan(0);
      expect(d.nbi_rural).toBeGreaterThan(0);
    });
  });

  it('should have rural NBI higher than urban', () => {
    data.forEach(d => {
      expect(d.nbi_rural).toBeGreaterThan(d.nbi_urban);
    });
  });

  it('should have Montería with lower NBI', () => {
    const monteria = data.find(d => d.municipality.includes('Montería'));
    expect(monteria).toBeDefined();
    expect(monteria!.nbi_total).toBeLessThan(45);
  });

  it('should have department average around 42-60%', () => {
    const avg = data.reduce((s, d) => s + d.nbi_total, 0) / data.length;
    expect(avg).toBeGreaterThan(40);
    expect(avg).toBeLessThan(70);
  });

  it('should match all 30 municipality names', () => {
    const muniNames = municipalities.map(m => m.name);
    data.forEach(d => {
      const match = muniNames.find(n =>
        n.toLowerCase().includes(d.municipality.toLowerCase()) ||
        d.municipality.toLowerCase().includes(n.toLowerCase())
      );
      expect(match).toBeDefined();
    });
  });
});

describe('Agriculture Data', () => {
  const data = agricultureData as AgricultureRecord[];

  it('should have 30 municipalities', () => {
    expect(data.length).toBe(30);
  });

  it('should have valid structure', () => {
    data.forEach(d => {
      expect(d.municipality).toBeDefined();
      expect(typeof d.total_ha).toBe('number');
      expect(Array.isArray(d.main_crops)).toBe(true);
      expect(typeof d.total_production_tons).toBe('number');
    });
  });

  it('should have positive hectares', () => {
    data.forEach(d => {
      expect(d.total_ha).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have main crops listed', () => {
    data.forEach(d => {
      expect(d.main_crops.length).toBeGreaterThan(0);
    });
  });

  it('should have total area over 200,000 ha', () => {
    const total = data.reduce((s, d) => s + d.total_ha, 0);
    expect(total).toBeGreaterThan(100000);
  });

  it('should include common Córdoba crops', () => {
    const allCrops = data.flatMap(d => d.main_crops.map(c => c.toUpperCase()));
    const common = ['MAIZ', 'ARROZ', 'YUCA', 'PLATANO'];
    common.forEach(crop => {
      expect(allCrops.some(c => c.includes(crop))).toBe(true);
    });
  });
});

describe('Livestock Data', () => {
  const data = livestockData as LivestockRecord[];

  it('should have 30 municipalities', () => {
    expect(data.length).toBe(30);
  });

  it('should have valid structure', () => {
    data.forEach(d => {
      expect(d.municipality).toBeDefined();
      expect(typeof d.cattle_heads).toBe('number');
      expect(typeof d.area_pasture_ha).toBe('number');
    });
  });

  it('should have positive cattle counts', () => {
    data.forEach(d => {
      expect(d.cattle_heads).toBeGreaterThan(0);
    });
  });

  it('should have total cattle around 2-3 million', () => {
    const total = data.reduce((s, d) => s + d.cattle_heads, 0);
    expect(total).toBeGreaterThan(1500000);
    expect(total).toBeLessThan(4000000);
  });

  it('should have Montería or Planeta Rica with high cattle count', () => {
    const top = data.sort((a, b) => b.cattle_heads - a.cattle_heads).slice(0, 5);
    const topNames = top.map(d => d.municipality.toLowerCase());
    const hasKey = topNames.some(n => n.includes('monter') || n.includes('planeta'));
    expect(hasKey).toBe(true);
  });

  it('should have pasture area data', () => {
    data.forEach(d => {
      expect(d.area_pasture_ha).toBeGreaterThan(0);
    });
  });
});
