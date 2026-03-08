import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MapView from '@/components/map/MapView';
import type { MunicipalAlert } from '@/types';
import { alertLevels } from '@/data/thresholds';
import { municipalities } from '@/data/municipalities';

// Mock JSON data imports
vi.mock('@/data/cordoba-boundaries.json', () => ({
  default: { type: 'FeatureCollection', features: [] },
}));
vi.mock('@/data/cordoba-rivers.json', () => ({
  default: { type: 'FeatureCollection', features: [] },
}));
vi.mock('@/data/ideam-stations.json', () => ({
  default: [],
}));

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
  it('should render the map container', () => {
    render(<MapView alerts={mockAlerts} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('should render markers for municipalities and monitoring points', () => {
    render(<MapView alerts={mockAlerts} />);
    const markers = screen.getAllByTestId('marker');
    // 30 municipalities + 4 monitoring points = 34
    expect(markers.length).toBe(34);
  });

  it('should render tile layers', () => {
    render(<MapView alerts={mockAlerts} />);
    const tileLayers = screen.getAllByTestId('tile-layer');
    expect(tileLayers.length).toBeGreaterThan(0);
  });

  it('should render zoom control', () => {
    render(<MapView alerts={mockAlerts} />);
    expect(screen.getByTestId('zoom-control')).toBeInTheDocument();
  });

  it('should render with empty alerts', () => {
    render(<MapView alerts={[]} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('should render the legend', () => {
    render(<MapView alerts={mockAlerts} />);
    expect(screen.getByText('Leyenda')).toBeInTheDocument();
  });

  it('should show satellite/map toggle', () => {
    render(<MapView alerts={mockAlerts} />);
    expect(screen.getByText('Satélite')).toBeInTheDocument();
    expect(screen.getByText('Mapa')).toBeInTheDocument();
  });

  it('should toggle between satellite and map view', () => {
    render(<MapView alerts={mockAlerts} />);
    const mapBtn = screen.getByText('Mapa');
    fireEvent.click(mapBtn);
    const tileLayers = screen.getAllByTestId('tile-layer');
    const hasCartoDB = tileLayers.some(t => t.getAttribute('data-url')?.includes('carto'));
    expect(hasCartoDB).toBe(true);
  });

  it('should render popups with municipality info', () => {
    render(<MapView alerts={mockAlerts} />);
    const popups = screen.getAllByTestId('popup');
    expect(popups.length).toBeGreaterThan(0);
  });

  it('should show municipality names in popups', () => {
    render(<MapView alerts={mockAlerts} />);
    expect(screen.getByText('Montería')).toBeInTheDocument();
  });

  it('should render monitoring point markers', () => {
    render(<MapView alerts={[]} />);
    const markers = screen.getAllByTestId('marker');
    // At least 4 monitoring points
    expect(markers.length).toBeGreaterThanOrEqual(4);
  });

  it('should show "Ver detalle" links', () => {
    render(<MapView alerts={mockAlerts} />);
    const links = screen.getAllByText(/Ver detalle/);
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render GeoJSON layers for boundaries and rivers', () => {
    render(<MapView alerts={mockAlerts} />);
    const geojsonLayers = screen.getAllByTestId('geojson');
    expect(geojsonLayers.length).toBe(2); // boundaries + rivers
  });

  it('should show layer control button', () => {
    render(<MapView alerts={mockAlerts} />);
    const capasElements = screen.getAllByText('Capas');
    expect(capasElements.length).toBeGreaterThan(0);
  });

  it('should show layer options when layer control is clicked', () => {
    render(<MapView alerts={mockAlerts} />);
    // Click any button that contains "Capas" text
    const capasElements = screen.getAllByText('Capas');
    // Click each until we find the one that expands the layer panel
    for (const el of capasElements) {
      const btn = el.closest('button') || el;
      fireEvent.click(btn);
    }
    expect(screen.getByText('Alertas municipales')).toBeInTheDocument();
  });

  it('should display precipitation data in popups', () => {
    render(<MapView alerts={mockAlerts} />);
    const precElements = screen.getAllByText(/45/);
    expect(precElements.length).toBeGreaterThan(0);
  });

  it('should display river discharge in popups', () => {
    render(<MapView alerts={mockAlerts} />);
    expect(screen.getByText(/800/)).toBeInTheDocument();
  });

  it('should show cuenca info in popups', () => {
    render(<MapView alerts={mockAlerts} />);
    const cuencaElements = screen.getAllByText(/Sinú Media/);
    expect(cuencaElements.length).toBeGreaterThan(0);
  });

  it('should show population in popups', () => {
    render(<MapView alerts={mockAlerts} />);
    expect(screen.getByText(/505\.000/)).toBeInTheDocument();
  });

  it('should show priority in popups', () => {
    render(<MapView alerts={mockAlerts} />);
    const altas = screen.getAllByText(/Alta/);
    expect(altas.length).toBeGreaterThan(0);
  });
});
