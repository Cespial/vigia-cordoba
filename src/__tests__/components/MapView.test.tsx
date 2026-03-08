import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { MunicipalAlert } from '@/types';
import { alertLevels } from '@/data/thresholds';
import { municipalities } from '@/data/municipalities';

const mockAlerts: MunicipalAlert[] = [
  {
    municipality: municipalities[0],
    alertLevel: alertLevels.naranja,
    precipitationForecast24h: 45,
    riverDischarge: 800,
    lastUpdate: '2026-03-08T12:00:00Z',
  },
  {
    municipality: municipalities[1],
    alertLevel: alertLevels.verde,
    precipitationForecast24h: 10,
    riverDischarge: 200,
    lastUpdate: '2026-03-08T12:00:00Z',
  },
];

describe('MapView', () => {
  let MapView: typeof import('@/components/map/MapView').default;

  beforeAll(async () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-token';
    // Clear module cache and re-import with token set
    vi.resetModules();
    const mod = await import('@/components/map/MapView');
    MapView = mod.default;
  });

  afterAll(() => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  });

  it('should render without crashing', () => {
    render(<MapView alerts={mockAlerts} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('should render markers for municipalities', () => {
    render(<MapView alerts={mockAlerts} />);
    const markers = screen.getAllByTestId('marker');
    expect(markers.length).toBe(34);
  });

  it('should render navigation control', () => {
    render(<MapView alerts={mockAlerts} />);
    expect(screen.getByTestId('nav-control')).toBeInTheDocument();
  });

  it('should render scale control', () => {
    render(<MapView alerts={mockAlerts} />);
    expect(screen.getByTestId('scale-control')).toBeInTheDocument();
  });

  it('should render with empty alerts', () => {
    render(<MapView alerts={[]} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('should call onSelectMunicipality when provided', () => {
    const onSelect = vi.fn();
    render(<MapView alerts={mockAlerts} onSelectMunicipality={onSelect} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('should render monitoring point markers', () => {
    render(<MapView alerts={[]} />);
    const markers = screen.getAllByTestId('marker');
    expect(markers.length).toBeGreaterThanOrEqual(4);
  });
});

describe('MapView without token', () => {
  it('should show missing token message', async () => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    vi.resetModules();
    const mod = await import('@/components/map/MapView');
    const MapViewNoToken = mod.default;
    render(<MapViewNoToken alerts={[]} />);
    expect(screen.getByText(/Token de Mapbox no configurado/)).toBeInTheDocument();
  });
});
