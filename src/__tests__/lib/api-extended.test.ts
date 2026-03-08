import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('API Module — fetchWeather', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('should call Open-Meteo forecast API', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ hourly: {}, daily: {} }),
    } as Response);
    const { fetchWeather } = await import('@/lib/api');
    await fetchWeather(8.75, -75.88);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('api.open-meteo.com');
  });

  it('should include latitude parameter', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchWeather } = await import('@/lib/api');
    await fetchWeather(9.23, -75.81);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('latitude=9.23');
  });

  it('should include longitude parameter', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchWeather } = await import('@/lib/api');
    await fetchWeather(9.23, -75.81);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('longitude=-75.81');
  });

  it('should request hourly precipitation', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchWeather } = await import('@/lib/api');
    await fetchWeather(8.75, -75.88);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('precipitation');
  });

  it('should request temperature', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchWeather } = await import('@/lib/api');
    await fetchWeather(8.75, -75.88);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('temperature_2m');
  });

  it('should set timezone to America/Bogota', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchWeather } = await import('@/lib/api');
    await fetchWeather(8.75, -75.88);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('America/Bogota');
  });

  it('should throw on non-ok response', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false, status: 500,
    } as Response);
    const { fetchWeather } = await import('@/lib/api');
    await expect(fetchWeather(8.75, -75.88)).rejects.toThrow();
  });

  it('should request 7 forecast days', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchWeather } = await import('@/lib/api');
    await fetchWeather(8.75, -75.88);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('forecast_days=7');
  });
});

describe('API Module — fetchFlood', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('should call flood API', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchFlood } = await import('@/lib/api');
    await fetchFlood(8.75, -75.88);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('flood-api.open-meteo.com');
  });

  it('should request river_discharge', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchFlood } = await import('@/lib/api');
    await fetchFlood(8.75, -75.88);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('river_discharge');
  });

  it('should request 90 past days', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchFlood } = await import('@/lib/api');
    await fetchFlood(8.75, -75.88);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('past_days=90');
  });

  it('should request 30 forecast days', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchFlood } = await import('@/lib/api');
    await fetchFlood(8.75, -75.88);
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('forecast_days=30');
  });

  it('should throw on non-ok response', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false, status: 404,
    } as Response);
    const { fetchFlood } = await import('@/lib/api');
    await expect(fetchFlood(8.75, -75.88)).rejects.toThrow();
  });
});

describe('API Module — fetchHistoricalWeather', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('should call archive API', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchHistoricalWeather } = await import('@/lib/api');
    await fetchHistoricalWeather(8.75, -75.88, '2025-01-01', '2025-12-31');
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('archive-api.open-meteo.com');
  });

  it('should include start_date', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchHistoricalWeather } = await import('@/lib/api');
    await fetchHistoricalWeather(8.75, -75.88, '2025-01-01', '2025-12-31');
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('start_date=2025-01-01');
  });

  it('should include end_date', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({}),
    } as Response);
    const { fetchHistoricalWeather } = await import('@/lib/api');
    await fetchHistoricalWeather(8.75, -75.88, '2025-01-01', '2025-06-30');
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('end_date=2025-06-30');
  });

  it('should throw on error', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false, status: 500,
    } as Response);
    const { fetchHistoricalWeather } = await import('@/lib/api');
    await expect(fetchHistoricalWeather(8.75, -75.88, '2025-01-01', '2025-12-31')).rejects.toThrow();
  });
});

describe('API Module — fetchDatosGov', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('should call datos.gov.co API', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve([]),
    } as Response);
    const { fetchDatosGov } = await import('@/lib/api');
    await fetchDatosGov('test-dataset');
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('datos.gov.co');
  });

  it('should include dataset ID in URL', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve([]),
    } as Response);
    const { fetchDatosGov } = await import('@/lib/api');
    await fetchDatosGov('my-dataset-id');
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('my-dataset-id');
  });

  it('should pass query params', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve([]),
    } as Response);
    const { fetchDatosGov } = await import('@/lib/api');
    await fetchDatosGov('test', { '$limit': '100', '$where': 'x=1' });
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('100');
  });

  it('should set Accept: application/json header', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve([]),
    } as Response);
    const { fetchDatosGov } = await import('@/lib/api');
    await fetchDatosGov('test');
    const options = vi.mocked(global.fetch).mock.calls[0][1] as RequestInit;
    expect((options.headers as Record<string, string>)['Accept']).toBe('application/json');
  });

  it('should throw on error', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false, status: 403,
    } as Response);
    const { fetchDatosGov } = await import('@/lib/api');
    await expect(fetchDatosGov('test')).rejects.toThrow();
  });
});
