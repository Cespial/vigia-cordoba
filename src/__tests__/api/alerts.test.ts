import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('GET /api/alerts', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('should return alerts array', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        daily: { precipitation_sum: [15, 10], river_discharge: [200, 180] },
      }),
    } as Response);

    const response = await GET();
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should include all 30 municipalities', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        daily: { precipitation_sum: [0], river_discharge: [0] },
      }),
    } as Response);

    const response = await GET();
    const data = await response.json();
    expect(data.length).toBe(30);
  });

  it('should include alert level for each municipality', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        daily: { precipitation_sum: [5], river_discharge: [100] },
      }),
    } as Response);

    const response = await GET();
    const data = await response.json();
    data.forEach((alert: { alertLevel: { level: string } }) => {
      expect(['rojo', 'naranja', 'amarillo', 'verde']).toContain(alert.alertLevel.level);
    });
  });

  it('should include precipitationForecast24h', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        daily: { precipitation_sum: [25], river_discharge: [150] },
      }),
    } as Response);

    const response = await GET();
    const data = await response.json();
    data.forEach((alert: { precipitationForecast24h: number }) => {
      expect(typeof alert.precipitationForecast24h).toBe('number');
    });
  });

  it('should include riverDischarge', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        daily: { precipitation_sum: [10], river_discharge: [300] },
      }),
    } as Response);

    const response = await GET();
    const data = await response.json();
    data.forEach((alert: { riverDischarge: number }) => {
      expect(typeof alert.riverDischarge).toBe('number');
    });
  });

  it('should include lastUpdate timestamp', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        daily: { precipitation_sum: [0], river_discharge: [0] },
      }),
    } as Response);

    const response = await GET();
    const data = await response.json();
    data.forEach((alert: { lastUpdate: string }) => {
      expect(alert.lastUpdate).toBeTruthy();
    });
  });

  it('should handle API failures gracefully for individual municipalities', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    let callCount = 0;
    vi.mocked(global.fetch).mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.reject(new Error('fail'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          daily: { precipitation_sum: [0], river_discharge: [0] },
        }),
      } as Response);
    });

    const response = await GET();
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should set cache headers', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        daily: { precipitation_sum: [0], river_discharge: [0] },
      }),
    } as Response);

    const response = await GET();
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=1800');
  });
});
