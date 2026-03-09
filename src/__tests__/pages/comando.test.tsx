import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock JSON data files that the page may import
vi.mock('@/data/ideam-stations.json', () => ({
  default: [
    { municipality: 'MONTERIA', active: true },
    { municipality: 'LORICA', active: true },
    { municipality: 'TIERRALTA', active: true },
  ],
}));

vi.mock('@/data/nbi-data.json', () => ({
  default: [
    { municipality: 'Montería', nbi_total: 44.8 },
    { municipality: 'Lorica', nbi_total: 62.5 },
    { municipality: 'Tierralta', nbi_total: 70.1 },
  ],
}));

vi.mock('@/data/livestock-data.json', () => ({
  default: [
    { municipality: 'Montería', cattle_heads: 350000 },
    { municipality: 'Lorica', cattle_heads: 125000 },
    { municipality: 'Tierralta', cattle_heads: 80000 },
  ],
}));

vi.mock('@/data/education-institutions.json', () => ({
  default: [
    { municipality: 'Montería', count: 450 },
    { municipality: 'Lorica', count: 180 },
    { municipality: 'Tierralta', count: 120 },
  ],
}));

vi.mock('@/data/health-institutions.json', () => ({
  default: [
    { municipality: 'MONTERÍA', total: 320 },
    { municipality: 'LORICA', total: 45 },
    { municipality: 'TIERRALTA', total: 30 },
  ],
}));

vi.mock('@/data/ungrd-emergencies.json', () => ({
  default: [
    { municipality: 'MONTERIA', affected: 2500 },
    { municipality: 'LORICA', affected: 1800 },
  ],
}));

vi.mock('@/data/agriculture-data.json', () => ({
  default: [
    { municipality: 'Montería', hectares: 50000 },
    { municipality: 'Lorica', hectares: 30000 },
    { municipality: 'Tierralta', hectares: 20000 },
  ],
}));

import { useAlerts } from '@/lib/hooks';
import ComandoPage from '@/app/comando/page';

const mockUseAlerts = vi.mocked(useAlerts);

beforeEach(() => {
  mockUseAlerts.mockReturnValue({
    alerts: mockAlerts,
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
  // Mock clipboard
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe('Centro de Comando Page - Situational Banner', () => {
  it('renders the situational banner with alert level', () => {
    render(<ComandoPage />);
    // The highest alert level among our mock alerts is 'rojo'
    expect(screen.getByText(/ALERTA ROJA/i)).toBeInTheDocument();
  });

  it('shows municipality count by alert level', () => {
    render(<ComandoPage />);
    // Should display counts for each alert level present
    // We have 1 rojo, 1 naranja, 1 amarillo
    const pageContent = document.body.textContent || '';
    // At minimum, the banner should reference counts or level labels
    expect(pageContent).toMatch(/roj/i);
    expect(pageContent).toMatch(/naranja/i);
    expect(pageContent).toMatch(/amarill/i);
  });
});

describe('Centro de Comando Page - Priority Actions', () => {
  it('renders priority actions section', () => {
    render(<ComandoPage />);
    expect(screen.getByTestId('priority-actions')).toBeInTheDocument();
  });

  it('lists municipalities in rojo first', () => {
    render(<ComandoPage />);
    const prioritySection = screen.getByTestId('priority-actions');
    const textContent = prioritySection.textContent || '';
    const monteriaIndex = textContent.indexOf('Montería');
    const loricaIndex = textContent.indexOf('Lorica');
    // Montería (rojo) should appear before Lorica (naranja)
    expect(monteriaIndex).toBeGreaterThanOrEqual(0);
    expect(monteriaIndex).toBeLessThan(loricaIndex);
  });

  it('does not show amarillo/verde municipalities in priority actions', () => {
    render(<ComandoPage />);
    const prioritySection = screen.getByTestId('priority-actions');
    const textContent = prioritySection.textContent || '';
    // Tierralta is amarillo and should NOT appear in priority actions
    expect(textContent).not.toContain('Tierralta');
  });
});

describe('Centro de Comando Page - Impact Estimation', () => {
  it('shows impact estimation panel', () => {
    render(<ComandoPage />);
    expect(screen.getByTestId('impact-panel')).toBeInTheDocument();
  });

  it('displays population exposed estimate', () => {
    render(<ComandoPage />);
    const impactPanel = screen.getByTestId('impact-panel');
    const textContent = impactPanel.textContent || '';
    // Should show some population number — could be formatted with dots or commas
    // Montería has 505,000, Lorica 120,000 — combined or individual should appear
    expect(textContent).toMatch(/\d[\d.,]*\d/);
  });

  it('displays economic impact estimate', () => {
    render(<ComandoPage />);
    const pageContent = document.body.textContent || '';
    // Economic impact should mention "millones" or "mil millones"
    expect(pageContent).toMatch(/mil\s*millones|millones/i);
  });
});

describe('Centro de Comando Page - Protocol Phases', () => {
  it('renders all 4 protocol phases', () => {
    render(<ComandoPage />);
    const pageContent = document.body.textContent || '';
    // Flexible matching for phase labels (could be "Fase 1", "FASE 1", "Fase I", etc.)
    expect(pageContent).toMatch(/fase\s*1/i);
    expect(pageContent).toMatch(/fase\s*2/i);
    expect(pageContent).toMatch(/fase\s*3/i);
    expect(pageContent).toMatch(/fase\s*4/i);
  });

  it('shows protocol action items', () => {
    render(<ComandoPage />);
    const pageContent = document.body.textContent || '';
    // Protocol actions should include activating the COE or similar emergency actions
    expect(pageContent).toMatch(/activar/i);
  });
});

describe('Centro de Comando Page - Communications', () => {
  it('renders communications section', () => {
    render(<ComandoPage />);
    expect(screen.getByTestId('communications-section')).toBeInTheDocument();
  });

  it('has copy button for WhatsApp template', () => {
    render(<ComandoPage />);
    const copyButtons = screen.getAllByText(/copiar/i);
    expect(copyButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('copies WhatsApp template to clipboard on click', async () => {
    render(<ComandoPage />);
    const copyButtons = screen.getAllByText(/copiar/i);
    fireEvent.click(copyButtons[0]);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });
});

describe('Centro de Comando Page - Loading State', () => {
  it('shows loading skeleton when loading', () => {
    mockUseAlerts.mockReturnValue({
      alerts: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<ComandoPage />);
    // When loading, the alert banner text should not be present
    expect(screen.queryByText(/ALERTA ROJA/i)).not.toBeInTheDocument();
  });
});

describe('Centro de Comando Page - Title', () => {
  it('shows the command center heading or title', () => {
    render(<ComandoPage />);
    const pageContent = document.body.textContent || '';
    // Should contain "Centro de Comando" or "Comando" somewhere
    expect(pageContent).toMatch(/centro\s*de\s*comando|comando/i);
  });
});
