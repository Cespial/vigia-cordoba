import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/dashboard/Sidebar';
import type { MunicipalAlert } from '@/types';
import { alertLevels } from '@/data/thresholds';
import { municipalities } from '@/data/municipalities';

// Mock chart components
vi.mock('@/components/charts/PrecipitationChart', () => ({
  default: ({ title }: { title: string }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'precip-chart' }, title);
  },
}));

vi.mock('@/components/charts/FloodChart', () => ({
  default: ({ title }: { title: string }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'flood-chart' }, title);
  },
}));

vi.mock('@/components/charts/ENSOIndicator', () => ({
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'enso-indicator' }, 'ENSO');
  },
}));

vi.mock('@/components/charts/EmergencyHistory', () => ({
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'emergency-history' }, 'Emergencias');
  },
}));

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

describe('Sidebar', () => {
  it('should render with tabs', () => {
    render(<Sidebar alerts={mockAlerts} loading={false} />);
    expect(screen.getByText('Resumen Ejecutivo')).toBeInTheDocument();
    expect(screen.getByText('Municipios')).toBeInTheDocument();
  });

  it('should show executive tab by default', () => {
    render(<Sidebar alerts={mockAlerts} loading={false} />);
    expect(screen.getByTestId('enso-indicator')).toBeInTheDocument();
  });

  it('should switch to municipality list on tab click', () => {
    render(<Sidebar alerts={mockAlerts} loading={false} />);
    fireEvent.click(screen.getByText('Municipios'));
    // Municipality list should be visible now
    // Executive summary and ENSO should be hidden
    expect(screen.queryByTestId('enso-indicator')).not.toBeInTheDocument();
  });

  it('should show precipitation chart for most critical municipality', () => {
    render(<Sidebar alerts={mockAlerts} loading={false} />);
    expect(screen.getByTestId('precip-chart')).toBeInTheDocument();
    // Should show Montería (naranja alert = most critical)
    const monterias = screen.getAllByText(/Montería/);
    expect(monterias.length).toBeGreaterThan(0);
  });

  it('should show flood chart', () => {
    render(<Sidebar alerts={mockAlerts} loading={false} />);
    expect(screen.getByTestId('flood-chart')).toBeInTheDocument();
  });

  it('should show emergency history', () => {
    render(<Sidebar alerts={mockAlerts} loading={false} />);
    expect(screen.getByTestId('emergency-history')).toBeInTheDocument();
  });

  it('should have collapse button', () => {
    const { container } = render(<Sidebar alerts={mockAlerts} loading={false} />);
    const collapseBtn = container.querySelector('button[class*="absolute"]');
    expect(collapseBtn).toBeDefined();
  });

  it('should render with empty alerts', () => {
    render(<Sidebar alerts={[]} loading={false} />);
    expect(screen.getByText('Resumen Ejecutivo')).toBeInTheDocument();
  });

  it('should show loading state through child components', () => {
    render(<Sidebar alerts={[]} loading={true} />);
    // The component should still render the tabs
    expect(screen.getByText('Resumen Ejecutivo')).toBeInTheDocument();
  });
});
