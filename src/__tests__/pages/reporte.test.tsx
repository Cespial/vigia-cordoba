import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { alertLevels } from '@/data/thresholds';
import { municipalities } from '@/data/municipalities';
import type { MunicipalAlert } from '@/types';

const mockAlerts: MunicipalAlert[] = [
  {
    municipality: municipalities[0], // Montería
    alertLevel: alertLevels.naranja,
    precipitationForecast24h: 55,
    riverDischarge: 750,
    lastUpdate: '2026-03-08T12:00:00Z',
  },
  {
    municipality: municipalities[1], // Lorica
    alertLevel: alertLevels.rojo,
    precipitationForecast24h: 85,
    riverDischarge: 1300,
    lastUpdate: '2026-03-08T12:00:00Z',
  },
  {
    municipality: municipalities[2], // Tierralta
    alertLevel: alertLevels.amarillo,
    precipitationForecast24h: 25,
    riverDischarge: 350,
    lastUpdate: '2026-03-08T12:00:00Z',
  },
  {
    municipality: municipalities[3], // Valencia
    alertLevel: alertLevels.verde,
    precipitationForecast24h: 8,
    riverDischarge: 120,
    lastUpdate: '2026-03-08T12:00:00Z',
  },
];

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

vi.mock('@/data/ideam-stations.json', () => ({
  default: [
    { municipality: 'MONTERIA', active: true },
    { municipality: 'MONTERIA', active: true },
    { municipality: 'MONTERIA', active: false },
    { municipality: 'LORICA', active: true },
    { municipality: 'TIERRALTA', active: true },
  ],
}));

vi.mock('@/data/nbi-data.json', () => ({
  default: [
    { municipality: 'Montería', nbi_total: 44.8 },
    { municipality: 'Lorica', nbi_total: 62.5 },
    { municipality: 'Tierralta', nbi_total: 70.1 },
    { municipality: 'Valencia', nbi_total: 55.0 },
  ],
}));

vi.mock('@/data/livestock-data.json', () => ({
  default: [
    { municipality: 'Montería', cattle_heads: 350000 },
    { municipality: 'Lorica', cattle_heads: 125000 },
    { municipality: 'Tierralta', cattle_heads: 80000 },
    { municipality: 'Valencia', cattle_heads: 40000 },
  ],
}));

vi.mock('@/data/education-institutions.json', () => ({
  default: [
    { municipality: 'Montería', count: 450 },
    { municipality: 'Lorica', count: 180 },
    { municipality: 'Tierralta', count: 120 },
    { municipality: 'Valencia', count: 60 },
  ],
}));

vi.mock('@/data/health-institutions.json', () => ({
  default: [
    { municipality: 'MONTERÍA', total: 320 },
    { municipality: 'LORICA', total: 45 },
    { municipality: 'TIERRALTA', total: 30 },
    { municipality: 'VALENCIA', total: 15 },
  ],
}));

vi.mock('@/data/ungrd-emergencies.json', () => ({
  default: [
    { municipality: 'MONTERIA', affected: 2500 },
    { municipality: 'LORICA', affected: 1800 },
  ],
}));

import ReportePage from '@/app/reporte/page';

describe('Reporte Page - Loading state', () => {
  it('should show loading message when data is loading', () => {
    mockUseAlerts.mockReturnValue({
      alerts: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<ReportePage />);
    expect(screen.getByText(/Generando informe/)).toBeInTheDocument();
  });
});

describe('Reporte Page - Empty state', () => {
  beforeEach(() => {
    mockUseAlerts.mockReturnValue({
      alerts: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('should show no-data message when alerts are empty', () => {
    render(<ReportePage />);
    expect(screen.getByText(/Sin datos disponibles/)).toBeInTheDocument();
  });
});

describe('Reporte Page - With data', () => {
  beforeEach(() => {
    mockUseAlerts.mockReturnValue({
      alerts: mockAlerts,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('should render the report title', () => {
    render(<ReportePage />);
    expect(screen.getByText(/INFORME DE SITUACIÓN — SAT Córdoba/)).toBeInTheDocument();
  });

  it('should render the department subtitle', () => {
    render(<ReportePage />);
    expect(screen.getByText(/Departamento de Córdoba, Colombia/)).toBeInTheDocument();
  });

  it('should render the print button', () => {
    render(<ReportePage />);
    expect(screen.getByText(/Imprimir \/ Guardar PDF/)).toBeInTheDocument();
  });

  it('should call window.print when print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<ReportePage />);
    const btn = screen.getByText(/Imprimir \/ Guardar PDF/);
    fireEvent.click(btn);
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('should show the overall alert level as ROJO (highest severity)', () => {
    render(<ReportePage />);
    expect(screen.getByText(/ALERTA ROJO/)).toBeInTheDocument();
  });

  it('should display section 1 - Estado General', () => {
    render(<ReportePage />);
    expect(screen.getByText(/1\. Estado General del Departamento/)).toBeInTheDocument();
  });

  it('should display alert level counts in summary table', () => {
    render(<ReportePage />);
    // Multiple instances exist (summary table + cuenca/critical tables), so use getAllByText
    expect(screen.getAllByText('Alerta Roja').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Alerta Naranja').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Alerta Amarilla').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sin Alerta').length).toBeGreaterThanOrEqual(1);
  });

  it('should display section 2 - Municipios Críticos', () => {
    render(<ReportePage />);
    expect(screen.getByText(/2\. Municipios Críticos/)).toBeInTheDocument();
    // Lorica should appear (rojo alert)
    expect(screen.getByText('Lorica')).toBeInTheDocument();
    // Montería should appear (naranja alert)
    expect(screen.getByText('Montería')).toBeInTheDocument();
  });

  it('should display section 3 - Análisis por Cuenca', () => {
    render(<ReportePage />);
    expect(screen.getByText(/3\. Análisis por Cuenca/)).toBeInTheDocument();
    // Cuenca names may appear in multiple places (cuenca table + critical table), so use getAllByText
    expect(screen.getAllByText('Sinú Media').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sinú Baja').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sinú Alta').length).toBeGreaterThanOrEqual(1);
  });

  it('should display section 4 - Indicadores Socioeconómicos', () => {
    render(<ReportePage />);
    expect(screen.getByText(/4\. Indicadores Socioeconómicos/)).toBeInTheDocument();
    expect(screen.getByText(/NBI promedio departamental/)).toBeInTheDocument();
    expect(screen.getByText(/Cabezas de ganado/)).toBeInTheDocument();
    expect(screen.getByText(/Sedes educativas/)).toBeInTheDocument();
    expect(screen.getByText(/Centros de salud/)).toBeInTheDocument();
  });

  it('should display section 5 - Fuentes de Datos', () => {
    render(<ReportePage />);
    expect(screen.getByText(/5\. Fuentes de Datos/)).toBeInTheDocument();
    expect(screen.getByText('Open-Meteo')).toBeInTheDocument();
    expect(screen.getByText('GloFAS (Copernicus)')).toBeInTheDocument();
    expect(screen.getByText('IDEAM')).toBeInTheDocument();
    expect(screen.getByText('UNGRD')).toBeInTheDocument();
    expect(screen.getByText('NOAA')).toBeInTheDocument();
    expect(screen.getByText('DANE')).toBeInTheDocument();
  });

  it('should display the report footer', () => {
    render(<ReportePage />);
    expect(screen.getByText(/Generado automáticamente por SAT Córdoba/)).toBeInTheDocument();
    expect(screen.getByText(/sat-cordoba\.vercel\.app/)).toBeInTheDocument();
  });

  it('should display population KPI indicators', () => {
    render(<ReportePage />);
    expect(screen.getByText(/Población alto riesgo/)).toBeInTheDocument();
    expect(screen.getByText(/Población en riesgo/)).toBeInTheDocument();
  });
});
