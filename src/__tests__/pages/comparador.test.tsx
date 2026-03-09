import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComparadorPage from '@/app/comparador/page';
import type { MunicipalAlert } from '@/types';

const mockAlerts: MunicipalAlert[] = [
  {
    municipality: {
      name: 'Montería',
      slug: 'monteria',
      lat: 8.75,
      lon: -75.8833,
      cuenca: 'Sinú Media',
      priority: 'Alta',
      population: 505000,
    },
    alertLevel: { level: 'rojo', label: 'Alerta Roja', color: '#dc2626', description: '' },
    precipitationForecast24h: 85.2,
    riverDischarge: 1350.5,
    lastUpdate: '2026-03-08T12:00:00Z',
  },
  {
    municipality: {
      name: 'Lorica',
      slug: 'lorica',
      lat: 9.2367,
      lon: -75.8136,
      cuenca: 'Sinú Baja',
      priority: 'Alta',
      population: 120000,
    },
    alertLevel: { level: 'naranja', label: 'Alerta Naranja', color: '#f97316', description: '' },
    precipitationForecast24h: 52.3,
    riverDischarge: 780.1,
    lastUpdate: '2026-03-08T12:00:00Z',
  },
  {
    municipality: {
      name: 'Tierralta',
      slug: 'tierralta',
      lat: 8.1714,
      lon: -76.0592,
      cuenca: 'Sinú Alta',
      priority: 'Alta',
      population: 100000,
    },
    alertLevel: { level: 'amarillo', label: 'Alerta Amarilla', color: '#eab308', description: '' },
    precipitationForecast24h: 30.1,
    riverDischarge: 450.0,
    lastUpdate: '2026-03-08T12:00:00Z',
  },
];

// Mock useAlerts hook
vi.mock('@/lib/hooks', () => ({
  useAlerts: vi.fn(),
}));

import { useAlerts } from '@/lib/hooks';
const mockUseAlerts = vi.mocked(useAlerts);

beforeEach(() => {
  mockUseAlerts.mockReturnValue({
    alerts: mockAlerts,
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
});

// Helper to select a municipality by name from the selector dropdown
function selectMuni(name: string) {
  // Open selector if not already open
  if (!screen.queryByTestId('municipality-selector')) {
    fireEvent.click(screen.getByTestId('add-municipality-btn'));
  }
  const btns = screen.getByTestId('municipality-selector').querySelectorAll('button');
  const btn = Array.from(btns).find(b => b.textContent === name);
  if (!btn) throw new Error(`Municipality button "${name}" not found in selector`);
  fireEvent.click(btn);
}

describe('ComparadorPage', () => {
  it('renders the page heading', () => {
    render(<ComparadorPage />);
    expect(screen.getByText('Comparador de Municipios')).toBeInTheDocument();
  });

  it('renders the subtitle with instructions', () => {
    render(<ComparadorPage />);
    expect(
      screen.getByText('Seleccione 2 a 3 municipios para comparar indicadores lado a lado')
    ).toBeInTheDocument();
  });

  it('shows the municipality selector section', () => {
    render(<ComparadorPage />);
    expect(screen.getByText('Seleccionar municipios')).toBeInTheDocument();
    expect(screen.getByTestId('add-municipality-btn')).toBeInTheDocument();
  });

  it('shows the prompt when fewer than 2 municipalities are selected', () => {
    render(<ComparadorPage />);
    expect(screen.getByTestId('comparison-prompt')).toBeInTheDocument();
    expect(
      screen.getByText('Seleccione al menos 2 municipios para comenzar la comparacion')
    ).toBeInTheDocument();
  });

  it('opens the municipality dropdown when clicking the add button', () => {
    render(<ComparadorPage />);
    fireEvent.click(screen.getByTestId('add-municipality-btn'));
    expect(screen.getByTestId('municipality-selector')).toBeInTheDocument();
  });

  it('lists all 30 municipalities in the selector', () => {
    render(<ComparadorPage />);
    fireEvent.click(screen.getByTestId('add-municipality-btn'));
    const selector = screen.getByTestId('municipality-selector');
    const buttons = selector.querySelectorAll('button');
    expect(buttons.length).toBe(30);
  });

  it('adds a municipality when clicked in the selector', () => {
    render(<ComparadorPage />);
    selectMuni('Montería');
    // The prompt should still show since only 1 is selected
    expect(screen.getByTestId('comparison-prompt')).toBeInTheDocument();
  });

  it('renders comparison cards when 2 municipalities are selected', async () => {
    render(<ComparadorPage />);
    selectMuni('Montería');
    selectMuni('Lorica');

    await waitFor(() => {
      expect(screen.getByTestId('comparison-results')).toBeInTheDocument();
    });
  });

  it('shows all indicator category headings when comparing', async () => {
    render(<ComparadorPage />);
    selectMuni('Montería');
    selectMuni('Lorica');

    await waitFor(() => {
      expect(screen.getByText('Nivel de Alerta')).toBeInTheDocument();
      expect(screen.getByText('Indicadores Hidrometeorologicos')).toBeInTheDocument();
      expect(screen.getByText('Demografia y Vulnerabilidad')).toBeInTheDocument();
      expect(screen.getByText('Infraestructura y Exposicion')).toBeInTheDocument();
      expect(screen.getByText('Historial de Emergencias')).toBeInTheDocument();
      expect(screen.getByText('Resumen Comparativo')).toBeInTheDocument();
    });
  });

  it('shows the summary comparison table with all rows', async () => {
    render(<ComparadorPage />);
    selectMuni('Montería');
    selectMuni('Lorica');

    await waitFor(() => {
      const table = screen.getByTestId('comparison-table');
      expect(table).toBeInTheDocument();
      // Verify table has all indicator rows by querying within the table
      const { getByText } = {
        getByText: (text: string) => {
          const cells = table.querySelectorAll('td');
          const match = Array.from(cells).find(td => td.textContent === text);
          if (!match) throw new Error(`Text "${text}" not found in table`);
          return match;
        },
      };
      expect(getByText('Nivel de alerta')).toBeTruthy();
      expect(getByText('Precipitacion 24h')).toBeTruthy();
      expect(getByText('Caudal')).toBeTruthy();
      expect(getByText('Poblacion')).toBeTruthy();
      expect(getByText('NBI')).toBeTruthy();
      expect(getByText('Sedes educativas')).toBeTruthy();
      expect(getByText('Centros de salud')).toBeTruthy();
      expect(getByText('Cabezas de ganado')).toBeTruthy();
      expect(getByText('Emergencias historicas')).toBeTruthy();
    });
  });

  it('shows loading skeleton when data is loading', () => {
    mockUseAlerts.mockReturnValue({
      alerts: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<ComparadorPage />);
    // Should not show the heading inside the main content area
    expect(screen.queryByText('Comparador de Municipios')).not.toBeInTheDocument();
  });

  it('removes a municipality when clicking its chip', async () => {
    render(<ComparadorPage />);
    selectMuni('Montería');
    selectMuni('Lorica');

    // Comparison should be visible
    await waitFor(() => {
      expect(screen.getByTestId('comparison-results')).toBeInTheDocument();
    });

    // Find and click the Monteria chip to remove it
    const chips = screen.getAllByRole('button');
    const monteriaChip = chips.find(
      btn => btn.textContent?.includes('Montería') && btn.querySelector('svg')
    );
    expect(monteriaChip).toBeDefined();
    fireEvent.click(monteriaChip!);

    // Comparison should disappear since only 1 municipality remains
    await waitFor(() => {
      expect(screen.getByTestId('comparison-prompt')).toBeInTheDocument();
    });
  });

  it('displays the selection counter', () => {
    render(<ComparadorPage />);
    expect(screen.getByText('0/3')).toBeInTheDocument();
  });
});
