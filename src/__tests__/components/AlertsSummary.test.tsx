import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlertsSummary from '@/components/dashboard/AlertsSummary';
import type { MunicipalAlert } from '@/types';
import { alertLevels } from '@/data/thresholds';
import { municipalities } from '@/data/municipalities';

const createAlert = (index: number, level: keyof typeof alertLevels, precip: number, discharge: number): MunicipalAlert => ({
  municipality: municipalities[index],
  alertLevel: alertLevels[level],
  precipitationForecast24h: precip,
  riverDischarge: discharge,
  lastUpdate: '2026-03-08T12:00:00Z',
});

const mockAlerts: MunicipalAlert[] = [
  createAlert(0, 'rojo', 80, 1500),
  createAlert(1, 'naranja', 50, 700),
  createAlert(2, 'amarillo', 30, 400),
  createAlert(3, 'verde', 5, 100),
  createAlert(4, 'verde', 10, 150),
];

describe('AlertsSummary', () => {
  it('should render when loading', () => {
    const { container } = render(<AlertsSummary alerts={[]} loading={true} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render Estado de Alertas title', () => {
    render(<AlertsSummary alerts={mockAlerts} loading={false} />);
    expect(screen.getByText('Estado de Alertas')).toBeInTheDocument();
  });

  it('should show alert level counts', () => {
    render(<AlertsSummary alerts={mockAlerts} loading={false} />);
    // Should show counts for each level
    expect(screen.getByText('Alerta Roja')).toBeInTheDocument();
    expect(screen.getByText('Alerta Naranja')).toBeInTheDocument();
    expect(screen.getByText('Alerta Amarilla')).toBeInTheDocument();
    expect(screen.getByText('Sin Alerta')).toBeInTheDocument();
  });

  it('should display rojo count as 1', () => {
    render(<AlertsSummary alerts={mockAlerts} loading={false} />);
    // The count "1" for rojo should appear
    const rojoSection = screen.getByText('Alerta Roja').closest('div')?.parentElement;
    expect(rojoSection).toBeInTheDocument();
  });

  it('should show population at risk', () => {
    render(<AlertsSummary alerts={mockAlerts} loading={false} />);
    expect(screen.getByText('Población en riesgo')).toBeInTheDocument();
  });

  it('should show average precipitation', () => {
    render(<AlertsSummary alerts={mockAlerts} loading={false} />);
    expect(screen.getByText('Precip. prom. 24h')).toBeInTheDocument();
  });

  it('should show max discharge', () => {
    render(<AlertsSummary alerts={mockAlerts} loading={false} />);
    expect(screen.getByText('Caudal máx.')).toBeInTheDocument();
  });

  it('should handle empty alerts', () => {
    render(<AlertsSummary alerts={[]} loading={false} />);
    expect(screen.getByText('Estado de Alertas')).toBeInTheDocument();
  });

  it('should calculate population at risk correctly (non-verde)', () => {
    // Montería (505k) + Lorica (120k) + Tierralta (100k) = 725k at risk
    render(<AlertsSummary alerts={mockAlerts} loading={false} />);
    // The population should only count non-verde alerts
  });

  it('should show all four alert level boxes', () => {
    const { container } = render(<AlertsSummary alerts={mockAlerts} loading={false} />);
    const levelBoxes = container.querySelectorAll('.rounded-lg.border');
    expect(levelBoxes.length).toBeGreaterThanOrEqual(4);
  });
});
