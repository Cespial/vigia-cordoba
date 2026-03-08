import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MapView from '@/components/map/MapView';
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
    // After clicking "Mapa", it should change the tile layer
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
    const links = screen.getAllByText('Ver detalle');
    expect(links.length).toBeGreaterThan(0);
  });
});
