import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('GET /api/flood', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('should return flood data for default coordinates', async () => {
    const { GET } = await import('@/app/api/flood/route');
    const mockData = { daily: { time: [], river_discharge: [] } };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve(mockData),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/flood');
    const response = await GET(req);
    const data = await response.json();
    expect(data).toEqual(mockData);
  });

  it('should use default coordinates when none provided', async () => {
    const { GET } = await import('@/app/api/flood/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/flood');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('latitude=8.75');
    expect(url).toContain('longitude=-75.88');
  });

  it('should accept custom coordinates', async () => {
    const { GET } = await import('@/app/api/flood/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/flood?lat=7.88&lon=-76.25');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('latitude=7.88');
    expect(url).toContain('longitude=-76.25');
  });

  it('should return 500 on error', async () => {
    const { GET } = await import('@/app/api/flood/route');
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('fail'));

    const req = new NextRequest('http://localhost:3000/api/flood');
    const response = await GET(req);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('should set cache headers', async () => {
    const { GET } = await import('@/app/api/flood/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);

    const req = new NextRequest('http://localhost:3000/api/flood');
    const response = await GET(req);
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600');
  });
});
