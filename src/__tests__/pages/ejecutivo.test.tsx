import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { alertLevels } from '@/data/thresholds';
import { municipalities } from '@/data/municipalities';
import type { MunicipalAlert } from '@/types';

const mockAlerts: MunicipalAlert[] = [
  {
    municipality: municipalities[0],
    alertLevel: alertLevels.naranja,
    precipitationForecast24h: 50,
    riverDischarge: 700,
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

// Default mock returns empty alerts
const mockUseAlerts = vi.fn(() => ({
  alerts: [] as MunicipalAlert[],
  loading: false,
  error: null,
  refetch: vi.fn(),
}));

vi.mock('@/lib/hooks', () => ({
  useAlerts: () => mockUseAlerts(),
  useWeather: () => ({ data: null, loading: false }),
  useFlood: () => ({ data: null, loading: false }),
}));

vi.mock('@/components/charts/PrecipitationChart', () => ({
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'precip-chart' });
  },
}));

vi.mock('@/components/charts/FloodChart', () => ({
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'flood-chart' });
  },
}));

vi.mock('@/components/charts/ENSOIndicator', () => ({
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'enso' }, 'ENSO Component');
  },
}));

vi.mock('@/components/charts/EmergencyHistory', () => ({
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'emergency' }, 'Emergency Component');
  },
}));

import EjecutivoPage from '@/app/ejecutivo/page';

describe('Ejecutivo Page - Empty state', () => {
  beforeEach(() => {
    mockUseAlerts.mockReturnValue({
      alerts: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('should render the page header', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText('SAT Córdoba')).toBeInTheDocument();
  });

  it('should show "Sin datos" when no alerts', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText('Sin datos disponibles')).toBeInTheDocument();
  });

  it('should show navigation links', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText('Ejecutivo')).toBeInTheDocument();
    expect(screen.getByText('Mapa')).toBeInTheDocument();
  });
});

describe('Ejecutivo Page - With alerts', () => {
  beforeEach(() => {
    mockUseAlerts.mockReturnValue({
      alerts: mockAlerts,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('should show Panel Ejecutivo title', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText('Panel Ejecutivo')).toBeInTheDocument();
  });

  it('should show department subtitle', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText(/Departamento de Córdoba/)).toBeInTheDocument();
  });

  it('should show alert banner with correct level', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText(/ALERTA NARANJA/)).toBeInTheDocument();
  });

  it('should show population at risk', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText(/Población alto riesgo/)).toBeInTheDocument();
  });

  it('should show precipitation max', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText(/Precipitación máx/)).toBeInTheDocument();
  });

  it('should show discharge max', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText(/Caudal máximo/)).toBeInTheDocument();
  });

  it('should show critical municipalities section', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText('Top 10 Municipios Críticos')).toBeInTheDocument();
  });

  it('should show cuenca analysis', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText('Análisis por Cuenca Hidrográfica')).toBeInTheDocument();
  });

  it('should show infrastructure stats', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText('Infraestructura de Monitoreo')).toBeInTheDocument();
    expect(screen.getByText('229')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should show data source tags', () => {
    render(<EjecutivoPage />);
    expect(screen.getByText('Open-Meteo')).toBeInTheDocument();
    expect(screen.getByText('IDEAM')).toBeInTheDocument();
    expect(screen.getByText('UNGRD')).toBeInTheDocument();
    expect(screen.getByText('NOAA')).toBeInTheDocument();
  });

  it('should show ENSO component', () => {
    render(<EjecutivoPage />);
    expect(screen.getByTestId('enso')).toBeInTheDocument();
  });

  it('should show emergency history component', () => {
    render(<EjecutivoPage />);
    expect(screen.getByTestId('emergency')).toBeInTheDocument();
  });

  it('should show municipality links', () => {
    render(<EjecutivoPage />);
    // Should have link to Montería (most critical)
    const links = screen.getAllByRole('link');
    const muniLinks = links.filter(l => l.getAttribute('href')?.includes('/municipio/'));
    expect(muniLinks.length).toBeGreaterThan(0);
  });
});

describe('Ejecutivo Page - Loading state', () => {
  it('should show loading skeleton', () => {
    mockUseAlerts.mockReturnValue({
      alerts: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<EjecutivoPage />);
    // Loading state should render header
    expect(screen.getByText('SAT Córdoba')).toBeInTheDocument();
  });
});
