export interface Municipality {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  cuenca: 'Sinú Alta' | 'Sinú Media' | 'Sinú Baja' | 'San Jorge Alta' | 'San Jorge Baja' | 'Canalete';
  priority: 'Alta' | 'Media' | 'Baja';
  population?: number;
}

export interface AlertLevel {
  level: 'rojo' | 'naranja' | 'amarillo' | 'verde';
  label: string;
  color: string;
  description: string;
}

export interface WeatherData {
  time: string[];
  precipitation: number[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  wind_speed_10m: number[];
}

export interface FloodData {
  time: string[];
  river_discharge: number[];
  river_discharge_mean: number[];
  river_discharge_max: number[];
}

export interface DailyWeather {
  time: string[];
  precipitation_sum: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export interface Emergency {
  fecha: string;
  departamento: string;
  municipio: string;
  tipo_evento: string;
  personas_afectadas?: number;
  familias_afectadas?: number;
  viviendas_afectadas?: number;
  hectareas_afectadas?: number;
  descripcion?: string;
}

export interface Station {
  codigo: string;
  nombre: string;
  departamento: string;
  municipio: string;
  latitud: number;
  longitud: number;
  tipo: string;
  estado: string;
}

export interface MunicipalAlert {
  municipality: Municipality;
  alertLevel: AlertLevel;
  precipitationForecast24h: number;
  riverDischarge: number;
  lastUpdate: string;
}
