import { NextResponse } from 'next/server';
import { municipalities } from '@/data/municipalities';
import { getCombinedAlert } from '@/data/thresholds';
import type { MunicipalAlert } from '@/types';

export const revalidate = 1800;

async function fetchWeatherForPoint(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&timezone=America/Bogota&forecast_days=1&past_days=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function fetchFloodForPoint(lat: number, lon: number) {
  const url = `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&past_days=1&forecast_days=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export async function GET() {
  try {
    // Fetch data for priority municipalities (limit to avoid rate limits)
    const priorityMunicipalities = municipalities.filter(m => m.priority === 'Alta' || m.priority === 'Media');

    const alerts: MunicipalAlert[] = await Promise.all(
      priorityMunicipalities.map(async (muni) => {
        const [weather, flood] = await Promise.all([
          fetchWeatherForPoint(muni.lat, muni.lon).catch(() => null),
          fetchFloodForPoint(muni.lat, muni.lon).catch(() => null),
        ]);

        const precip = weather?.daily?.precipitation_sum?.[1] ?? weather?.daily?.precipitation_sum?.[0] ?? 0;
        const discharge = flood?.daily?.river_discharge?.[1] ?? flood?.daily?.river_discharge?.[0] ?? 0;

        return {
          municipality: muni,
          alertLevel: getCombinedAlert(precip, discharge),
          precipitationForecast24h: precip,
          riverDischarge: discharge,
          lastUpdate: new Date().toISOString(),
        };
      })
    );

    // Add remaining municipalities with default verde
    const remainingMunicipalities = municipalities.filter(m => m.priority === 'Baja');
    const allAlerts = [
      ...alerts,
      ...remainingMunicipalities.map(muni => ({
        municipality: muni,
        alertLevel: getCombinedAlert(0, 0),
        precipitationForecast24h: 0,
        riverDischarge: 0,
        lastUpdate: new Date().toISOString(),
      })),
    ];

    return NextResponse.json(allAlerts, {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=900' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error generating alerts', details: String(error) },
      { status: 500 }
    );
  }
}
