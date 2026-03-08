import { NextRequest, NextResponse } from 'next/server';
import { fetchFlood } from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get('lat') || '8.75');
  const lon = parseFloat(searchParams.get('lon') || '-75.88');

  try {
    const data = await fetchFlood(lat, lon);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching flood data', details: String(error) },
      { status: 500 }
    );
  }
}
