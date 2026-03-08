const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const FLOOD_API_BASE = 'https://flood-api.open-meteo.com/v1/flood';
const ARCHIVE_API_BASE = 'https://archive-api.open-meteo.com/v1/archive';
const DATOS_GOV_BASE = 'https://www.datos.gov.co/resource';

export async function fetchWeather(lat: number, lon: number) {
  const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lon}&hourly=precipitation,temperature_2m,relative_humidity_2m,wind_speed_10m&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=America/Bogota&forecast_days=7&past_days=3`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
}

export async function fetchFlood(lat: number, lon: number) {
  const url = `${FLOOD_API_BASE}?latitude=${lat}&longitude=${lon}&daily=river_discharge,river_discharge_mean,river_discharge_max&past_days=90&forecast_days=30`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Flood API error: ${res.status}`);
  return res.json();
}

export async function fetchHistoricalWeather(lat: number, lon: number, startDate: string, endDate: string) {
  const url = `${ARCHIVE_API_BASE}?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=precipitation_sum&timezone=America/Bogota`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Archive API error: ${res.status}`);
  return res.json();
}

export async function fetchDatosGov(datasetId: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  const url = `${DATOS_GOV_BASE}/${datasetId}.json?${searchParams.toString()}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  const appToken = process.env.DATOS_GOV_APP_TOKEN;
  if (appToken) {
    headers['X-App-Token'] = appToken;
  }
  const res = await fetch(url, { headers, next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`datos.gov.co API error: ${res.status}`);
  return res.json();
}
