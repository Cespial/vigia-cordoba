import { NextRequest, NextResponse } from 'next/server';
import { fetchDatosGov } from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = searchParams.get('limit') || '500';
  const rawTipo = searchParams.get('tipo') || 'Inundación';
  // Sanitize tipo to prevent injection — only allow alphanumeric, spaces, accented chars
  const tipo = rawTipo.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  // Sanitize limit to prevent injection
  const safeLimit = String(Math.min(Math.max(1, parseInt(limit) || 500), 2000));

  try {
    const data = await fetchDatosGov('xjv9-mim9', {
      '$where': `upper(departamento)='CORDOBA' AND upper(tipo_evento) LIKE '%${tipo.toUpperCase()}%'`,
      '$order': 'fecha DESC',
      '$limit': safeLimit,
    });
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching emergencias', details: String(error) },
      { status: 500 }
    );
  }
}
