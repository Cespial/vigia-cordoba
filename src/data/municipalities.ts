import { Municipality } from '@/types';

export const municipalities: Municipality[] = [
  { name: 'Montería', slug: 'monteria', lat: 8.7500, lon: -75.8833, cuenca: 'Sinú Media', priority: 'Alta', population: 505_000 },
  { name: 'Lorica', slug: 'lorica', lat: 9.2367, lon: -75.8136, cuenca: 'Sinú Baja', priority: 'Alta', population: 120_000 },
  { name: 'Tierralta', slug: 'tierralta', lat: 8.1714, lon: -76.0592, cuenca: 'Sinú Alta', priority: 'Alta', population: 100_000 },
  { name: 'Valencia', slug: 'valencia', lat: 8.2533, lon: -76.1456, cuenca: 'Sinú Alta', priority: 'Alta', population: 45_000 },
  { name: 'Cereté', slug: 'cerete', lat: 8.8853, lon: -75.7919, cuenca: 'Sinú Media', priority: 'Media', population: 95_000 },
  { name: 'San Pelayo', slug: 'san-pelayo', lat: 8.9592, lon: -75.8369, cuenca: 'Sinú Media', priority: 'Media', population: 45_000 },
  { name: 'Ayapel', slug: 'ayapel', lat: 8.3128, lon: -75.1397, cuenca: 'San Jorge Baja', priority: 'Alta', population: 50_000 },
  { name: 'Montelíbano', slug: 'montelibano', lat: 7.9789, lon: -75.4181, cuenca: 'San Jorge Alta', priority: 'Alta', population: 80_000 },
  { name: 'Puerto Libertador', slug: 'puerto-libertador', lat: 7.8953, lon: -75.6722, cuenca: 'San Jorge Alta', priority: 'Alta', population: 50_000 },
  { name: 'San José de Uré', slug: 'san-jose-de-ure', lat: 7.7833, lon: -75.5333, cuenca: 'San Jorge Alta', priority: 'Media', population: 12_000 },
  { name: 'Ciénaga de Oro', slug: 'cienaga-de-oro', lat: 8.8781, lon: -75.6294, cuenca: 'Sinú Media', priority: 'Media', population: 65_000 },
  { name: 'San Carlos', slug: 'san-carlos', lat: 8.7933, lon: -75.6967, cuenca: 'Sinú Media', priority: 'Media', population: 25_000 },
  { name: 'Planeta Rica', slug: 'planeta-rica', lat: 8.4097, lon: -75.5847, cuenca: 'San Jorge Baja', priority: 'Media', population: 70_000 },
  { name: 'Pueblo Nuevo', slug: 'pueblo-nuevo', lat: 8.5589, lon: -75.4319, cuenca: 'San Jorge Baja', priority: 'Media', population: 35_000 },
  { name: 'Buenavista', slug: 'buenavista', lat: 8.4436, lon: -75.4803, cuenca: 'San Jorge Baja', priority: 'Baja', population: 22_000 },
  { name: 'La Apartada', slug: 'la-apartada', lat: 8.0497, lon: -75.3478, cuenca: 'San Jorge Alta', priority: 'Media', population: 16_000 },
  { name: 'San Bernardo del Viento', slug: 'san-bernardo-del-viento', lat: 9.3550, lon: -75.9608, cuenca: 'Sinú Baja', priority: 'Media', population: 35_000 },
  { name: 'Moñitos', slug: 'monitos', lat: 9.2339, lon: -76.1325, cuenca: 'Canalete', priority: 'Baja', population: 25_000 },
  { name: 'Los Córdobas', slug: 'los-cordobas', lat: 8.8919, lon: -76.3536, cuenca: 'Canalete', priority: 'Baja', population: 20_000 },
  { name: 'Puerto Escondido', slug: 'puerto-escondido', lat: 9.0172, lon: -76.2564, cuenca: 'Canalete', priority: 'Baja', population: 28_000 },
  { name: 'Canalete', slug: 'canalete', lat: 8.7906, lon: -76.2439, cuenca: 'Canalete', priority: 'Baja', population: 20_000 },
  { name: 'Cotorra', slug: 'cotorra', lat: 9.0556, lon: -75.7956, cuenca: 'Sinú Baja', priority: 'Media', population: 16_000 },
  { name: 'Purísima', slug: 'purisima', lat: 9.2372, lon: -75.7236, cuenca: 'Sinú Baja', priority: 'Media', population: 15_000 },
  { name: 'Momil', slug: 'momil', lat: 9.2381, lon: -75.6781, cuenca: 'Sinú Baja', priority: 'Media', population: 15_000 },
  { name: 'Chimá', slug: 'chima', lat: 9.1531, lon: -75.6322, cuenca: 'Sinú Baja', priority: 'Baja', population: 13_000 },
  { name: 'San Andrés de Sotavento', slug: 'san-andres-de-sotavento', lat: 9.1475, lon: -75.5136, cuenca: 'San Jorge Baja', priority: 'Baja', population: 55_000 },
  { name: 'Tuchín', slug: 'tuchin', lat: 9.1906, lon: -75.5522, cuenca: 'San Jorge Baja', priority: 'Baja', population: 38_000 },
  { name: 'San Antero', slug: 'san-antero', lat: 9.3742, lon: -75.7594, cuenca: 'Sinú Baja', priority: 'Baja', population: 32_000 },
  { name: 'Sahagún', slug: 'sahagun', lat: 8.9456, lon: -75.4425, cuenca: 'San Jorge Baja', priority: 'Baja', population: 90_000 },
  { name: 'Chinú', slug: 'chinu', lat: 9.0903, lon: -75.3939, cuenca: 'San Jorge Baja', priority: 'Baja', population: 48_000 },
];

export const monitoringPoints = [
  { name: 'Embalse Urrá I', lat: 7.8833, lon: -76.2500, type: 'hidroelectrica' as const },
  { name: 'Cotocá Abajo', lat: 9.1833, lon: -75.8333, type: 'estacion' as const },
  { name: 'Puerto Córdoba', lat: 8.4167, lon: -75.1833, type: 'estacion' as const },
  { name: 'Desembocadura Sinú', lat: 9.2367, lon: -75.8136, type: 'desembocadura' as const },
];

export const cuencas = [
  { name: 'Sinú Alta', color: '#1e40af' },
  { name: 'Sinú Media', color: '#3b82f6' },
  { name: 'Sinú Baja', color: '#60a5fa' },
  { name: 'San Jorge Alta', color: '#059669' },
  { name: 'San Jorge Baja', color: '#34d399' },
  { name: 'Canalete', color: '#f59e0b' },
];

export const CORDOBA_BOUNDS = {
  north: 9.46,
  south: 7.50,
  east: -74.80,
  west: -76.53,
  center: { lat: 8.35, lon: -75.85 } as const,
};
