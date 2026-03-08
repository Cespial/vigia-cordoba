import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('API Integration — Weather + Flood consistency', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('weather and flood APIs should accept same coordinates', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve({}),
    } as Response);

    const { GET: getWeather } = await import('@/app/api/weather/route');
    const { GET: getFlood } = await import('@/app/api/flood/route');

    const req1 = new NextRequest('http://localhost:3000/api/weather?lat=8.75&lon=-75.88');
    const req2 = new NextRequest('http://localhost:3000/api/flood?lat=8.75&lon=-75.88');

    const r1 = await getWeather(req1);
    const r2 = await getFlood(req2);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
  });

  it('weather API should return valid JSON', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve({ hourly: { time: [], precipitation: [] } }),
    } as Response);

    const { GET } = await import('@/app/api/weather/route');
    const req = new NextRequest('http://localhost:3000/api/weather');
    const response = await GET(req);
    const data = await response.json();
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });

  it('flood API should return valid JSON', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve({ daily: { time: [], river_discharge: [] } }),
    } as Response);

    const { GET } = await import('@/app/api/flood/route');
    const req = new NextRequest('http://localhost:3000/api/flood');
    const response = await GET(req);
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

describe('API Integration — Error Resilience', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('weather API should handle timeout gracefully', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('timeout'));
    const { GET } = await import('@/app/api/weather/route');
    const req = new NextRequest('http://localhost:3000/api/weather');
    const response = await GET(req);
    expect(response.status).toBe(500);
  });

  it('flood API should handle network error', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const { GET } = await import('@/app/api/flood/route');
    const req = new NextRequest('http://localhost:3000/api/flood');
    const response = await GET(req);
    expect(response.status).toBe(500);
  });

  it('stations API should handle network error', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('network'));
    const { GET } = await import('@/app/api/stations/route');
    const response = await GET();
    expect(response.status).toBe(500);
  });

  it('alerts API should handle partial failures', async () => {
    let callCount = 0;
    vi.mocked(global.fetch).mockImplementation(() => {
      callCount++;
      if (callCount % 3 === 0) {
        return Promise.reject(new Error('intermittent'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ daily: { precipitation_sum: [5], river_discharge: [100] } }),
      } as Response);
    });

    const { GET } = await import('@/app/api/alerts/route');
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('API Integration — Cache Headers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve({ daily: { precipitation_sum: [0], river_discharge: [0] } }),
    } as Response);
  });

  it('weather should cache for 1 hour', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const req = new NextRequest('http://localhost:3000/api/weather');
    const response = await GET(req);
    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('s-maxage=3600');
  });

  it('flood should cache for 1 hour', async () => {
    const { GET } = await import('@/app/api/flood/route');
    const req = new NextRequest('http://localhost:3000/api/flood');
    const response = await GET(req);
    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('s-maxage=3600');
  });

  it('alerts should cache for 30 minutes', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    const response = await GET();
    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('s-maxage=1800');
  });

  it('stations should cache for 24 hours', async () => {
    const { GET } = await import('@/app/api/stations/route');
    const response = await GET();
    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('s-maxage=86400');
  });

  it('weather should include stale-while-revalidate', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const req = new NextRequest('http://localhost:3000/api/weather');
    const response = await GET(req);
    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('stale-while-revalidate');
  });

  it('alerts should include stale-while-revalidate', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    const response = await GET();
    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('stale-while-revalidate');
  });
});

describe('API Integration — Coordinate Validation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
  });

  it('weather API should pass lat and lon to upstream', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const req = new NextRequest('http://localhost:3000/api/weather?lat=9.0&lon=-76.0');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('latitude=9');
    expect(url).toContain('longitude=-76');
  });

  it('flood API should pass lat and lon to upstream', async () => {
    const { GET } = await import('@/app/api/flood/route');
    const req = new NextRequest('http://localhost:3000/api/flood?lat=8.5&lon=-75.5');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('latitude=8.5');
    expect(url).toContain('longitude=-75.5');
  });

  it('weather API defaults to Montería coordinates', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const req = new NextRequest('http://localhost:3000/api/weather');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('latitude=8.75');
    expect(url).toContain('longitude=-75.88');
  });

  it('flood API defaults to Montería coordinates', async () => {
    const { GET } = await import('@/app/api/flood/route');
    const req = new NextRequest('http://localhost:3000/api/flood');
    await GET(req);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('latitude=8.75');
    expect(url).toContain('longitude=-75.88');
  });
});
