import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('API functions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  describe('fetchWeather', () => {
    it('should call Open-Meteo forecast API with correct URL', async () => {
      const { fetchWeather } = await import('@/lib/api');
      const mockData = { hourly: { time: [], precipitation: [] } };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);

      const result = await fetchWeather(8.75, -75.88);
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('api.open-meteo.com/v1/forecast');
      expect(url).toContain('latitude=8.75');
      expect(url).toContain('longitude=-75.88');
      expect(result).toEqual(mockData);
    });

    it('should include hourly and daily parameters', async () => {
      const { fetchWeather } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await fetchWeather(8.75, -75.88);
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('hourly=');
      expect(url).toContain('daily=');
      expect(url).toContain('forecast_days=7');
      expect(url).toContain('timezone=America/Bogota');
    });

    it('should throw on non-OK response', async () => {
      const { fetchWeather } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(fetchWeather(8.75, -75.88)).rejects.toThrow('Weather API error: 500');
    });

    it('should work with different coordinates', async () => {
      const { fetchWeather } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await fetchWeather(9.2367, -75.8136);
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('latitude=9.2367');
      expect(url).toContain('longitude=-75.8136');
    });

    it('should include past_days parameter', async () => {
      const { fetchWeather } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await fetchWeather(8.75, -75.88);
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('past_days=3');
    });
  });

  describe('fetchFlood', () => {
    it('should call Flood API with correct URL', async () => {
      const { fetchFlood } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ daily: {} }),
      } as Response);

      await fetchFlood(8.75, -75.88);
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('flood-api.open-meteo.com/v1/flood');
      expect(url).toContain('river_discharge');
    });

    it('should request 90 days of past data and 30 days forecast', async () => {
      const { fetchFlood } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await fetchFlood(8.75, -75.88);
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('past_days=90');
      expect(url).toContain('forecast_days=30');
    });

    it('should include river_discharge_mean and river_discharge_max', async () => {
      const { fetchFlood } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await fetchFlood(8.75, -75.88);
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('river_discharge_mean');
      expect(url).toContain('river_discharge_max');
    });

    it('should throw on non-OK response', async () => {
      const { fetchFlood } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(fetchFlood(8.75, -75.88)).rejects.toThrow('Flood API error: 404');
    });
  });

  describe('fetchHistoricalWeather', () => {
    it('should call Archive API with correct URL', async () => {
      const { fetchHistoricalWeather } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await fetchHistoricalWeather(8.75, -75.88, '2025-01-01', '2026-01-01');
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('archive-api.open-meteo.com/v1/archive');
      expect(url).toContain('start_date=2025-01-01');
      expect(url).toContain('end_date=2026-01-01');
    });

    it('should request daily precipitation_sum', async () => {
      const { fetchHistoricalWeather } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await fetchHistoricalWeather(8.75, -75.88, '2025-01-01', '2026-01-01');
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('precipitation_sum');
    });

    it('should throw on error', async () => {
      const { fetchHistoricalWeather } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response);

      await expect(fetchHistoricalWeather(8.75, -75.88, 'bad', 'dates'))
        .rejects.toThrow('Archive API error: 400');
    });
  });

  describe('fetchDatosGov', () => {
    it('should call datos.gov.co with correct dataset ID', async () => {
      const { fetchDatosGov } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      await fetchDatosGov('xjv9-mim9', { '$limit': '10' });
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('datos.gov.co/resource/xjv9-mim9.json');
    });

    it('should include Accept header', async () => {
      const { fetchDatosGov } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      await fetchDatosGov('hp9r-jxuu');
      const options = vi.mocked(global.fetch).mock.calls[0][1] as RequestInit;
      expect((options.headers as Record<string, string>)['Accept']).toBe('application/json');
    });

    it('should throw on non-OK response', async () => {
      const { fetchDatosGov } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
      } as Response);

      await expect(fetchDatosGov('test-id')).rejects.toThrow('datos.gov.co API error: 403');
    });

    it('should handle empty params', async () => {
      const { fetchDatosGov } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      await fetchDatosGov('hp9r-jxuu');
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('hp9r-jxuu.json');
    });

    it('should pass X-App-Token header if env var is set', async () => {
      process.env.DATOS_GOV_APP_TOKEN = 'test-token';
      const { fetchDatosGov } = await import('@/lib/api');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      await fetchDatosGov('test-id');
      const options = vi.mocked(global.fetch).mock.calls[0][1] as RequestInit;
      expect((options.headers as Record<string, string>)['X-App-Token']).toBe('test-token');
      delete process.env.DATOS_GOV_APP_TOKEN;
    });
  });
});
