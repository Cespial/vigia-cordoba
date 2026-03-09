import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ExtendedForecast from '@/components/charts/ExtendedForecast';

// Mock recharts to avoid rendering issues in test environment
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
}));

function makeDailyData(overrides: Partial<{
  precipitation_sum: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  weathercode: number[];
}> = {}) {
  return {
    daily: {
      time: [
        '2026-03-08',
        '2026-03-09',
        '2026-03-10',
        '2026-03-11',
        '2026-03-12',
        '2026-03-13',
        '2026-03-14',
      ],
      precipitation_sum: overrides.precipitation_sum ?? [5, 12, 0, 45, 80, 3, 20],
      temperature_2m_max: overrides.temperature_2m_max ?? [32, 30, 33, 29, 28, 31, 30],
      temperature_2m_min: overrides.temperature_2m_min ?? [22, 21, 23, 20, 19, 22, 21],
      precipitation_probability_max: overrides.precipitation_probability_max ?? [30, 60, 5, 85, 95, 15, 50],
      weathercode: overrides.weathercode ?? [1, 61, 0, 80, 95, 2, 51],
    },
  };
}

describe('ExtendedForecast', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  it('should show skeleton loaders while fetching', () => {
    // Never resolve the fetch so it stays in loading state
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}));

    render(<ExtendedForecast lat={8.75} lon={-75.88} />);
    // Should render 7 skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(7);
  });

  it('should render 7 day cards after data loads', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => makeDailyData(),
    } as Response);

    render(<ExtendedForecast lat={8.75} lon={-75.88} />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('forecast-day-card');
      expect(cards).toHaveLength(7);
    });
  });

  it('should display day names in Spanish', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => makeDailyData(),
    } as Response);

    render(<ExtendedForecast lat={8.75} lon={-75.88} />);

    await waitFor(() => {
      // 2026-03-08 is a Sunday = Dom
      expect(screen.getByText('Dom')).toBeInTheDocument();
      // 2026-03-09 is a Monday = Lun
      expect(screen.getByText('Lun')).toBeInTheDocument();
    });
  });

  it('should display formatted dates', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => makeDailyData(),
    } as Response);

    render(<ExtendedForecast lat={8.75} lon={-75.88} />);

    await waitFor(() => {
      expect(screen.getByText('8 Mar')).toBeInTheDocument();
      expect(screen.getByText('9 Mar')).toBeInTheDocument();
    });
  });

  it('should highlight days with precipitation > 40mm in amber', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => makeDailyData(),
    } as Response);

    render(<ExtendedForecast lat={8.75} lon={-75.88} />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('forecast-day-card');
      // Index 3 has precipitation=45 which is > 40 and <= 70 -> amber
      expect(cards[3].className).toContain('border-amber-500/60');
      expect(cards[3].className).toContain('bg-amber-950/30');
    });
  });

  it('should highlight days with precipitation > 70mm in red', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => makeDailyData(),
    } as Response);

    render(<ExtendedForecast lat={8.75} lon={-75.88} />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('forecast-day-card');
      // Index 4 has precipitation=80 which is > 70 -> red
      expect(cards[4].className).toContain('border-red-500/60');
      expect(cards[4].className).toContain('bg-red-950/30');
    });
  });

  it('should show error message when fetch fails', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    render(<ExtendedForecast lat={8.75} lon={-75.88} />);

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo cargar el pronóstico extendido')
      ).toBeInTheDocument();
    });
  });

  it('should show error when response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'server error' }),
    } as Response);

    render(<ExtendedForecast lat={8.75} lon={-75.88} />);

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo cargar el pronóstico extendido')
      ).toBeInTheDocument();
    });
  });

  it('should display max and min temperatures', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => makeDailyData(),
    } as Response);

    render(<ExtendedForecast lat={8.75} lon={-75.88} />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('forecast-day-card');
      // First day: max 32, min 22
      expect(cards[0].textContent).toContain('32°');
      expect(cards[0].textContent).toContain('22°');
      // Fifth day: max 28, min 19
      expect(cards[4].textContent).toContain('28°');
      expect(cards[4].textContent).toContain('19°');
    });
  });

  it('should display precipitation amounts and probabilities', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => makeDailyData(),
    } as Response);

    render(<ExtendedForecast lat={8.75} lon={-75.88} />);

    await waitFor(() => {
      // First day: 5.0 mm, 30% prob
      expect(screen.getByText('5.0 mm')).toBeInTheDocument();
      expect(screen.getByText('30% prob.')).toBeInTheDocument();
    });
  });

  it('should use custom title when provided', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => makeDailyData(),
    } as Response);

    render(
      <ExtendedForecast lat={8.75} lon={-75.88} title="Pronóstico — Montería" />
    );

    await waitFor(() => {
      expect(screen.getByText('Pronóstico — Montería')).toBeInTheDocument();
    });
  });

  it('should fetch from the correct API endpoint with lat/lon', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => makeDailyData(),
    } as Response);

    render(<ExtendedForecast lat={9.25} lon={-76.1} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/forecast-extended?lat=9.25&lon=-76.1'
      );
    });
  });
});
