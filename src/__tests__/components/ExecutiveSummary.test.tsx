import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExecutiveSummary from '@/components/dashboard/ExecutiveSummary';
import type { MunicipalAlert } from '@/types';
import { alertLevels } from '@/data/thresholds';
import { municipalities } from '@/data/municipalities';

const createAlert = (muniIndex: number, level: keyof typeof alertLevels, precip: number, discharge: number): MunicipalAlert => ({
  municipality: municipalities[muniIndex],
  alertLevel: alertLevels[level],
  precipitationForecast24h: precip,
  riverDischarge: discharge,
  lastUpdate: '2026-03-08T12:00:00Z',
});

const mockAlerts: MunicipalAlert[] = [
  createAlert(0, 'naranja', 55, 800),
  createAlert(1, 'verde', 10, 200),
  createAlert(2, 'rojo', 85, 1500),
  createAlert(3, 'amarillo', 35, 450),
  createAlert(4, 'verde', 15, 180),
];

describe('ExecutiveSummary', () => {
  it('should render with alerts', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    expect(screen.getByText(/ALERTA/)).toBeInTheDocument();
  });

  it('should return null with empty alerts', () => {
    const { container } = render(<ExecutiveSummary alerts={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('should show overall level as the highest alert', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    expect(screen.getByText('ALERTA ROJO')).toBeInTheDocument();
  });

  it('should show population at risk metrics', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    const riskElements = screen.getAllByText(/Población/);
    expect(riskElements.length).toBeGreaterThan(0);
  });

  it('should show precipitation max', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    expect(screen.getByText(/Precip/)).toBeInTheDocument();
  });

  it('should show discharge max', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    expect(screen.getByText(/Caudal/)).toBeInTheDocument();
  });

  it('should show critical municipalities section', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    expect(screen.getByText('Municipios críticos')).toBeInTheDocument();
  });

  it('should show cuenca analysis section', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    expect(screen.getByText('Estado por cuenca')).toBeInTheDocument();
  });

  it('should list cuenca names', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    expect(screen.getByText('Sinú Alta')).toBeInTheDocument();
    expect(screen.getByText('Sinú Media')).toBeInTheDocument();
  });

  it('should show number of municipalities in alert', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    // 3 municipalities in alert (rojo + naranja + amarillo)
    const threes = screen.getAllByText('3');
    expect(threes.length).toBeGreaterThan(0);
  });

  it('should show the most critical municipality first', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    // Tierralta (rojo) should appear in critical municipalities list
    const tierraltas = screen.getAllByText('Tierralta');
    expect(tierraltas.length).toBeGreaterThan(0);
  });

  it('should display all verde alerts correctly', () => {
    const verdeAlerts = [
      createAlert(0, 'verde', 5, 100),
      createAlert(1, 'verde', 8, 120),
    ];
    render(<ExecutiveSummary alerts={verdeAlerts} />);
    expect(screen.getByText('ALERTA VERDE')).toBeInTheDocument();
  });

  it('should show high risk population for naranja/rojo alerts', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    // Should have text about population percentage
    const percentElements = screen.getAllByText(/% del departamento/);
    expect(percentElements.length).toBeGreaterThan(0);
  });

  it('should handle single alert', () => {
    const single = [createAlert(0, 'naranja', 50, 700)];
    render(<ExecutiveSummary alerts={single} />);
    expect(screen.getByText('ALERTA NARANJA')).toBeInTheDocument();
  });

  it('should show max precipitation municipality', () => {
    render(<ExecutiveSummary alerts={mockAlerts} />);
    // Tierralta has max precip at 85mm
    const tierraltas = screen.getAllByText('Tierralta');
    expect(tierraltas.length).toBeGreaterThan(0);
  });
});
