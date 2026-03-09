import { NextRequest, NextResponse } from 'next/server';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  // Validate inputs
  const lat = parseFloat(latStr || '');
  const lon = parseFloat(lonStr || '');

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: 'Invalid parameters: lat and lon must be valid numbers' },
      { status: 400 }
    );
  }

  if (lat < -90 || lat > 90) {
    return NextResponse.json(
      { error: 'Invalid latitude: must be between -90 and 90' },
      { status: 400 }
    );
  }

  if (lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: 'Invalid longitude: must be between -180 and 180' },
      { status: 400 }
    );
  }

  try {
    const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=America/Bogota&forecast_days=7`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error(`Open-Meteo API error: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching extended forecast', details: String(error) },
      { status: 500 }
    );
  }
}
