import { describe, it, expect } from 'vitest';
import type { Municipality, AlertLevel, WeatherData, FloodData, DailyWeather, Emergency, Station, MunicipalAlert } from '@/types';
import { municipalities } from '@/data/municipalities';
import { alertLevels } from '@/data/thresholds';

describe('Municipality Type Validation', () => {
  it('should satisfy the Municipality interface', () => {
    const valid: Municipality = {
      name: 'Test',
      slug: 'test',
      lat: 8.5,
      lon: -75.5,
      cuenca: 'Sinú Media',
      priority: 'Alta',
    };
    expect(valid.name).toBe('Test');
  });

  it('population should be optional', () => {
    const withoutPop: Municipality = {
      name: 'Test',
      slug: 'test',
      lat: 8.5,
      lon: -75.5,
      cuenca: 'Canalete',
      priority: 'Baja',
    };
    expect(withoutPop.population).toBeUndefined();
  });

  it('all real municipalities should satisfy the type', () => {
    municipalities.forEach(m => {
      expect(typeof m.name).toBe('string');
      expect(typeof m.slug).toBe('string');
      expect(typeof m.lat).toBe('number');
      expect(typeof m.lon).toBe('number');
      expect(['Sinú Alta', 'Sinú Media', 'Sinú Baja', 'San Jorge Alta', 'San Jorge Baja', 'Canalete']).toContain(m.cuenca);
      expect(['Alta', 'Media', 'Baja']).toContain(m.priority);
    });
  });
});

describe('AlertLevel Type Validation', () => {
  it('should satisfy the AlertLevel interface', () => {
    const valid: AlertLevel = {
      level: 'rojo',
      label: 'Alerta Roja',
      color: '#dc2626',
      description: 'Riesgo inminente',
    };
    expect(valid.level).toBe('rojo');
  });

  it('all real alert levels should satisfy the type', () => {
    Object.values(alertLevels).forEach(al => {
      expect(typeof al.level).toBe('string');
      expect(typeof al.label).toBe('string');
      expect(typeof al.color).toBe('string');
      expect(typeof al.description).toBe('string');
      expect(['rojo', 'naranja', 'amarillo', 'verde']).toContain(al.level);
    });
  });
});

describe('WeatherData Type', () => {
  it('should satisfy the WeatherData interface', () => {
    const valid: WeatherData = {
      time: ['2026-03-08T00:00'],
      precipitation: [5.2],
      temperature_2m: [28.5],
      relative_humidity_2m: [85],
      wind_speed_10m: [12.3],
    };
    expect(valid.time).toHaveLength(1);
    expect(valid.precipitation[0]).toBe(5.2);
  });

  it('should allow empty arrays', () => {
    const empty: WeatherData = {
      time: [],
      precipitation: [],
      temperature_2m: [],
      relative_humidity_2m: [],
      wind_speed_10m: [],
    };
    expect(empty.time).toHaveLength(0);
  });
});

describe('FloodData Type', () => {
  it('should satisfy the FloodData interface', () => {
    const valid: FloodData = {
      time: ['2026-03-08'],
      river_discharge: [450],
      river_discharge_mean: [400],
      river_discharge_max: [550],
    };
    expect(valid.river_discharge[0]).toBe(450);
  });

  it('should handle multiple data points', () => {
    const multi: FloodData = {
      time: ['2026-03-07', '2026-03-08', '2026-03-09'],
      river_discharge: [400, 450, 500],
      river_discharge_mean: [380, 420, 460],
      river_discharge_max: [500, 550, 600],
    };
    expect(multi.time).toHaveLength(3);
    expect(multi.river_discharge).toHaveLength(3);
  });
});

describe('DailyWeather Type', () => {
  it('should satisfy the DailyWeather interface', () => {
    const valid: DailyWeather = {
      time: ['2026-03-08'],
      precipitation_sum: [15.5],
      temperature_2m_max: [32],
      temperature_2m_min: [24],
    };
    expect(valid.precipitation_sum[0]).toBe(15.5);
  });
});

describe('Emergency Type', () => {
  it('should satisfy the Emergency interface', () => {
    const valid: Emergency = {
      fecha: '2026-02-15T00:00:00',
      departamento: 'CORDOBA',
      municipio: 'MONTERIA',
      tipo_evento: 'Inundación',
    };
    expect(valid.municipio).toBe('MONTERIA');
  });

  it('should allow optional fields', () => {
    const minimal: Emergency = {
      fecha: '2026-01-01',
      departamento: 'CORDOBA',
      municipio: 'LORICA',
      tipo_evento: 'Inundación',
    };
    expect(minimal.personas_afectadas).toBeUndefined();
    expect(minimal.familias_afectadas).toBeUndefined();
    expect(minimal.viviendas_afectadas).toBeUndefined();
    expect(minimal.hectareas_afectadas).toBeUndefined();
    expect(minimal.descripcion).toBeUndefined();
  });

  it('should accept all optional fields', () => {
    const full: Emergency = {
      fecha: '2026-02-15',
      departamento: 'CORDOBA',
      municipio: 'AYAPEL',
      tipo_evento: 'Inundación',
      personas_afectadas: 5000,
      familias_afectadas: 1200,
      viviendas_afectadas: 800,
      hectareas_afectadas: 2500,
      descripcion: 'Desbordamiento del río San Jorge',
    };
    expect(full.personas_afectadas).toBe(5000);
    expect(full.descripcion).toContain('San Jorge');
  });
});

describe('Station Type', () => {
  it('should satisfy the Station interface', () => {
    const valid: Station = {
      codigo: '2502',
      nombre: 'MONTERIA',
      departamento: 'CORDOBA',
      municipio: 'MONTERIA',
      latitud: 8.75,
      longitud: -75.88,
      tipo: 'Limnimétrica',
      estado: 'Activa',
    };
    expect(valid.codigo).toBe('2502');
  });
});

describe('MunicipalAlert Type', () => {
  it('should satisfy the MunicipalAlert interface', () => {
    const valid: MunicipalAlert = {
      municipality: municipalities[0],
      alertLevel: alertLevels.verde,
      precipitationForecast24h: 5.2,
      riverDischarge: 150,
      lastUpdate: '2026-03-08T14:30:00Z',
    };
    expect(valid.municipality.name).toBe('Montería');
    expect(valid.alertLevel.level).toBe('verde');
  });

  it('should work with all alert levels', () => {
    (['rojo', 'naranja', 'amarillo', 'verde'] as const).forEach(level => {
      const alert: MunicipalAlert = {
        municipality: municipalities[0],
        alertLevel: alertLevels[level],
        precipitationForecast24h: 0,
        riverDischarge: 0,
        lastUpdate: new Date().toISOString(),
      };
      expect(alert.alertLevel.level).toBe(level);
    });
  });

  it('should work with all municipalities', () => {
    municipalities.forEach(m => {
      const alert: MunicipalAlert = {
        municipality: m,
        alertLevel: alertLevels.verde,
        precipitationForecast24h: 0,
        riverDischarge: 0,
        lastUpdate: new Date().toISOString(),
      };
      expect(alert.municipality.slug).toBe(m.slug);
    });
  });
});
