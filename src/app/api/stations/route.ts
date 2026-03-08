import { NextResponse } from 'next/server';
import { fetchDatosGov } from '@/lib/api';

export async function GET() {
  try {
    const data = await fetchDatosGov('hp9r-jxuu', {
      '$where': "upper(departamento)='CORDOBA'",
      '$limit': '500',
    });
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching stations', details: String(error) },
      { status: 500 }
    );
  }
}
