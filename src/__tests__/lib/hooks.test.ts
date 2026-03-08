import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAlerts, useWeather, useFlood } from '@/lib/hooks';

describe('useAlerts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => useAlerts());
    expect(result.current.loading).toBe(true);
  });

  it('should start with empty alerts', () => {
    const { result } = renderHook(() => useAlerts());
    expect(result.current.alerts).toEqual([]);
  });

  it('should start with no error', () => {
    const { result } = renderHook(() => useAlerts());
    expect(result.current.error).toBeNull();
  });

  it('should provide a refetch function', () => {
    const { result } = renderHook(() => useAlerts());
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should call fetch on mount', () => {
    renderHook(() => useAlerts());
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should call /api/alerts endpoint', () => {
    renderHook(() => useAlerts());
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain('/api/alerts');
  });
});

describe('useWeather', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => useWeather(8.75, -75.88));
    expect(result.current.loading).toBe(true);
  });

  it('should start with null data', () => {
    const { result } = renderHook(() => useWeather(8.75, -75.88));
    expect(result.current.data).toBeNull();
  });

  it('should call fetch on mount', () => {
    renderHook(() => useWeather(8.75, -75.88));
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should include lat and lon in fetch URL', () => {
    renderHook(() => useWeather(9.2367, -75.8136));
    const calls = vi.mocked(global.fetch).mock.calls;
    const weatherCall = calls.find(c => (c[0] as string).includes('/api/weather'));
    expect(weatherCall).toBeDefined();
    expect(weatherCall![0] as string).toContain('lat=9.2367');
    expect(weatherCall![0] as string).toContain('lon=-75.8136');
  });
});

describe('useFlood', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => useFlood(8.75, -75.88));
    expect(result.current.loading).toBe(true);
  });

  it('should start with null data', () => {
    const { result } = renderHook(() => useFlood(8.75, -75.88));
    expect(result.current.data).toBeNull();
  });

  it('should call fetch on mount', () => {
    renderHook(() => useFlood(8.75, -75.88));
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should include lat and lon in fetch URL', () => {
    renderHook(() => useFlood(8.75, -75.88));
    const calls = vi.mocked(global.fetch).mock.calls;
    const floodCall = calls.find(c => (c[0] as string).includes('/api/flood'));
    expect(floodCall).toBeDefined();
    expect(floodCall![0] as string).toContain('lat=8.75');
    expect(floodCall![0] as string).toContain('lon=-75.88');
  });
});
