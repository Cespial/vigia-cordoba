import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('GET /api/emergencias', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('should return emergencias data', async () => {
    const { GET } = await import('@/app/api/emergencias/route');
    const mockData = [{ fecha: '2026-01-15', municipio: 'MONTERIA' }];
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/emergencias');
    const response = await GET(req);
    const data = await response.json();
    expect(data).toEqual(mockData);
  });

  it('should use default limit of 500', async () => {
    const { GET } = await import('@/app/api/emergencias/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/emergencias');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('500');
  });

  it('should accept custom limit', async () => {
    const { GET } = await import('@/app/api/emergencias/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/emergencias?limit=100');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('100');
  });

  it('should filter by CORDOBA department', async () => {
    const { GET } = await import('@/app/api/emergencias/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/emergencias');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('CORDOBA');
  });

  it('should default to Inundación tipo', async () => {
    const { GET } = await import('@/app/api/emergencias/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/emergencias');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url.toUpperCase()).toContain('INUNDACI');
  });

  it('should order by fecha DESC', async () => {
    const { GET } = await import('@/app/api/emergencias/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/emergencias');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('fecha');
    expect(url).toContain('DESC');
  });

  it('should return 500 on API failure', async () => {
    const { GET } = await import('@/app/api/emergencias/route');
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('API error'));

    const req = new NextRequest('http://localhost:3000/api/emergencias');
    const response = await GET(req);
    expect(response.status).toBe(500);
  });

  it('should set cache headers', async () => {
    const { GET } = await import('@/app/api/emergencias/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/emergencias');
    const response = await GET(req);
    expect(response.headers.get('Cache-Control')).toContain('s-maxage');
  });

  it('should call datos.gov.co endpoint', async () => {
    const { GET } = await import('@/app/api/emergencias/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/emergencias');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('datos.gov.co');
    expect(url).toContain('xjv9-mim9');
  });
});
