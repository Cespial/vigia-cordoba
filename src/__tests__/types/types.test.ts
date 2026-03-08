import { describe, it, expect } from 'vitest';
import type { Municipality, AlertLevel, WeatherData, FloodData, Emergency, Station, MunicipalAlert } from '@/types';
import { municipalities } from '@/data/municipalities';
import { alertLevels } from '@/data/thresholds';

describe('Type structure validation', () => {
  describe('Municipality type', () => {
    it('should match the Municipality interface', () => {
      const muni: Municipality = municipalities[0];
      expect(typeof muni.name).toBe('string');
      expect(typeof muni.slug).toBe('string');
      expect(typeof muni.lat).toBe('number');
      expect(typeof muni.lon).toBe('number');
      expect(typeof muni.cuenca).toBe('string');
      expect(typeof muni.priority).toBe('string');
    });

    it('should allow optional population', () => {
      const muni: Municipality = {
        name: 'Test',
        slug: 'test',
        lat: 8.5,
        lon: -75.5,
        cuenca: 'Sinú Media',
        priority: 'Baja',
      };
      expect(muni.population).toBeUndefined();
    });

    it('should accept valid cuenca values', () => {
      const validCuencas: Municipality['cuenca'][] = [
        'Sinú Alta', 'Sinú Media', 'Sinú Baja',
        'San Jorge Alta', 'San Jorge Baja', 'Canalete',
      ];
      validCuencas.forEach(c => {
        const muni: Municipality = { name: 'T', slug: 't', lat: 8, lon: -75, cuenca: c, priority: 'Baja' };
        expect(muni.cuenca).toBe(c);
      });
    });

    it('should accept valid priority values', () => {
      const priorities: Municipality['priority'][] = ['Alta', 'Media', 'Baja'];
      priorities.forEach(p => {
        const muni: Municipality = { name: 'T', slug: 't', lat: 8, lon: -75, cuenca: 'Canalete', priority: p };
        expect(muni.priority).toBe(p);
      });
    });
  });

  describe('AlertLevel type', () => {
    it('should match the AlertLevel interface', () => {
      const alert: AlertLevel = alertLevels.rojo;
      expect(typeof alert.level).toBe('string');
      expect(typeof alert.label).toBe('string');
      expect(typeof alert.color).toBe('string');
      expect(typeof alert.description).toBe('string');
    });

    it('should have valid level values', () => {
      const levels: AlertLevel['level'][] = ['rojo', 'naranja', 'amarillo', 'verde'];
      levels.forEach(l => {
        expect(alertLevels[l].level).toBe(l);
      });
    });
  });

  describe('WeatherData type', () => {
    it('should accept valid weather data', () => {
      const data: WeatherData = {
        time: ['2026-03-08T00:00'],
        precipitation: [5.2],
        temperature_2m: [28.5],
        relative_humidity_2m: [75],
        wind_speed_10m: [12.3],
      };
      expect(data.time).toHaveLength(1);
      expect(data.precipitation[0]).toBe(5.2);
    });

    it('should handle empty arrays', () => {
      const data: WeatherData = {
        time: [],
        precipitation: [],
        temperature_2m: [],
        relative_humidity_2m: [],
        wind_speed_10m: [],
      };
      expect(data.time).toHaveLength(0);
    });
  });

  describe('FloodData type', () => {
    it('should accept valid flood data', () => {
      const data: FloodData = {
        time: ['2026-03-08'],
        river_discharge: [500],
        river_discharge_mean: [450],
        river_discharge_max: [600],
      };
      expect(data.river_discharge[0]).toBe(500);
    });
  });

  describe('Emergency type', () => {
    it('should accept complete emergency data', () => {
      const emergency: Emergency = {
        fecha: '2026-02-15',
        departamento: 'CORDOBA',
        municipio: 'MONTERIA',
        tipo_evento: 'Inundación',
        personas_afectadas: 5000,
        familias_afectadas: 1200,
        viviendas_afectadas: 800,
        hectareas_afectadas: 3000,
        descripcion: 'Desbordamiento del río Sinú',
      };
      expect(emergency.tipo_evento).toBe('Inundación');
    });

    it('should accept partial emergency data', () => {
      const emergency: Emergency = {
        fecha: '2026-02-15',
        departamento: 'CORDOBA',
        municipio: 'LORICA',
        tipo_evento: 'Inundación',
      };
      expect(emergency.personas_afectadas).toBeUndefined();
    });
  });

  describe('Station type', () => {
    it('should accept valid station data', () => {
      const station: Station = {
        codigo: '25027020',
        nombre: 'MONTERIA',
        departamento: 'CORDOBA',
        municipio: 'MONTERIA',
        latitud: 8.75,
        longitud: -75.88,
        tipo: 'Pluviométrica',
        estado: 'Activa',
      };
      expect(station.tipo).toBe('Pluviométrica');
    });
  });

  describe('MunicipalAlert type', () => {
    it('should combine municipality and alert data', () => {
      const alert: MunicipalAlert = {
        municipality: municipalities[0],
        alertLevel: alertLevels.naranja,
        precipitationForecast24h: 55,
        riverDischarge: 750,
        lastUpdate: '2026-03-08T14:30:00Z',
      };
      expect(alert.municipality.name).toBe('Montería');
      expect(alert.alertLevel.level).toBe('naranja');
    });
  });
});
