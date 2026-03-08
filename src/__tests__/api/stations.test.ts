import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('GET /api/stations', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('should return stations data', async () => {
    const { GET } = await import('@/app/api/stations/route');
    const mockData = [{ codigo: '2502', nombre: 'MONTERIA' }];
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve(mockData),
    } as Response);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(mockData);
  });

  it('should filter by CORDOBA department', async () => {
    const { GET } = await import('@/app/api/stations/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve([]),
    } as Response);

    await GET();
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('CORDOBA');
  });

  it('should use hp9r-jxuu dataset', async () => {
    const { GET } = await import('@/app/api/stations/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve([]),
    } as Response);

    await GET();
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('hp9r-jxuu');
  });

  it('should request up to 500 records', async () => {
    const { GET } = await import('@/app/api/stations/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve([]),
    } as Response);

    await GET();
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('500');
  });

  it('should return 500 on error', async () => {
    const { GET } = await import('@/app/api/stations/route');
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('fail'));

    const response = await GET();
    expect(response.status).toBe(500);
  });

  it('should have long cache duration (86400s)', async () => {
    const { GET } = await import('@/app/api/stations/route');
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve([]),
    } as Response);

    const response = await GET();
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=86400');
  });
});
