import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('GET /api/weather', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('should return weather data for default coordinates', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const mockData = { hourly: { time: [], precipitation: [] }, daily: {} };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/weather');
    const response = await GET(req);
    const data = await response.json();
    expect(data).toEqual(mockData);
    expect(response.status).toBe(200);
  });

  it('should use default lat=8.75 and lon=-75.88', async () => {
    const { GET } = await import('@/app/api/weather/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/weather');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('latitude=8.75');
    expect(url).toContain('longitude=-75.88');
  });

  it('should accept custom coordinates', async () => {
    const { GET } = await import('@/app/api/weather/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/weather?lat=9.23&lon=-75.81');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('latitude=9.23');
    expect(url).toContain('longitude=-75.81');
  });

  it('should return 500 on API error', async () => {
    const { GET } = await import('@/app/api/weather/route');
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('API down'));

    const req = new NextRequest('http://localhost:3000/api/weather');
    const response = await GET(req);
    expect(response.status).toBe(500);
  });

  it('should include Cache-Control header', async () => {
    const { GET } = await import('@/app/api/weather/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/weather');
    const response = await GET(req);
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600');
  });

  it('should include stale-while-revalidate', async () => {
    const { GET } = await import('@/app/api/weather/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/weather');
    const response = await GET(req);
    expect(response.headers.get('Cache-Control')).toContain('stale-while-revalidate');
  });
});
