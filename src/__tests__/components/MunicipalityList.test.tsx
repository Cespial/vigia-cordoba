import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MunicipalityList from '@/components/dashboard/MunicipalityList';
import type { MunicipalAlert } from '@/types';
import { alertLevels } from '@/data/thresholds';
import { municipalities } from '@/data/municipalities';

const mockAlerts: MunicipalAlert[] = municipalities.slice(0, 5).map((m, i) => ({
  municipality: m,
  alertLevel: alertLevels[['rojo', 'naranja', 'amarillo', 'verde', 'verde'][i] as keyof typeof alertLevels],
  precipitationForecast24h: [80, 50, 30, 10, 5][i],
  riverDischarge: [1500, 700, 400, 200, 100][i],
  lastUpdate: '2026-03-08T12:00:00Z',
}));

describe('MunicipalityList', () => {
  it('should render when loading', () => {
    const { container } = render(<MunicipalityList alerts={[]} loading={true} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render Municipios title', () => {
    render(<MunicipalityList alerts={mockAlerts} loading={false} />);
    expect(screen.getByText('Municipios')).toBeInTheDocument();
  });

  it('should show municipality count', () => {
    render(<MunicipalityList alerts={mockAlerts} loading={false} />);
    expect(screen.getByText('5 municipios')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<MunicipalityList alerts={mockAlerts} loading={false} />);
    expect(screen.getByPlaceholderText('Buscar municipio...')).toBeInTheDocument();
  });

  it('should show all municipality names', () => {
    render(<MunicipalityList alerts={mockAlerts} loading={false} />);
    mockAlerts.forEach(alert => {
      expect(screen.getByText(alert.municipality.name)).toBeInTheDocument();
    });
  });

  it('should filter municipalities by search term', () => {
    render(<MunicipalityList alerts={mockAlerts} loading={false} />);
    const input = screen.getByPlaceholderText('Buscar municipio...');
    fireEvent.change(input, { target: { value: 'Mont' } });
    expect(screen.getByText('Montería')).toBeInTheDocument();
    expect(screen.queryByText('Lorica')).not.toBeInTheDocument();
  });

  it('should show no results for non-matching search', () => {
    render(<MunicipalityList alerts={mockAlerts} loading={false} />);
    const input = screen.getByPlaceholderText('Buscar municipio...');
    fireEvent.change(input, { target: { value: 'ZZZZZ' } });
    expect(screen.queryByText('Montería')).not.toBeInTheDocument();
  });

  it('should sort by alert level (rojo first)', () => {
    const { container } = render(<MunicipalityList alerts={mockAlerts} loading={false} />);
    const links = container.querySelectorAll('a');
    expect(links[0].getAttribute('href')).toContain('monteria');
  });

  it('should have links to municipality pages', () => {
    render(<MunicipalityList alerts={mockAlerts} loading={false} />);
    const monteriaLink = screen.getByText('Montería').closest('a');
    expect(monteriaLink).toHaveAttribute('href', '/municipio/monteria');
  });

  it('should show cuenca info', () => {
    render(<MunicipalityList alerts={mockAlerts} loading={false} />);
    // Use getAllByText since multiple municipalities may share a cuenca
    const cuencaTexts = screen.getAllByText(/Sinú Media/);
    expect(cuencaTexts.length).toBeGreaterThan(0);
  });

  it('should be case-insensitive in search', () => {
    render(<MunicipalityList alerts={mockAlerts} loading={false} />);
    const input = screen.getByPlaceholderText('Buscar municipio...');
    fireEvent.change(input, { target: { value: 'montería' } });
    expect(screen.getByText('Montería')).toBeInTheDocument();
  });

  it('should handle empty alerts list', () => {
    render(<MunicipalityList alerts={[]} loading={false} />);
    expect(screen.getByText('Municipios')).toBeInTheDocument();
    expect(screen.getByText('0 municipios')).toBeInTheDocument();
  });
});
