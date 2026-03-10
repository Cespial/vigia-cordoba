import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

/* ── Mock next/dynamic to render a placeholder ── */
vi.mock('next/dynamic', () => ({
  default: () => {
    const Placeholder = () => <div data-testid="flood-map">FloodMap</div>;
    Placeholder.displayName = 'FloodMap';
    return Placeholder;
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import EventoInundacion2026 from '@/app/evento/inundacion-2026/page';

describe('Evento Inundación 2026 page', () => {
  beforeEach(() => {
    render(<EventoInundacion2026 />);
  });

  it('renders the hero section with title', () => {
    expect(screen.getByText(/Inundacion de Cordoba/i)).toBeDefined();
    expect(screen.getByText(/Febrero 2026/)).toBeDefined();
  });

  it('shows key KPIs', () => {
    expect(screen.getByText('78,000')).toBeDefined();
    expect(screen.getByText('73,475 ha')).toBeDefined();
    expect(screen.getByText('24/30')).toBeDefined();
  });

  it('renders the timeline with all events', () => {
    expect(screen.getByText('26 Ene')).toBeDefined();
    expect(screen.getByText('1 Feb')).toBeDefined();
    expect(screen.getByText('9 Feb')).toBeDefined();
    expect(screen.getByText('11 Feb')).toBeDefined();
  });

  it('shows alert level badges', () => {
    expect(screen.getByText('Alerta Amarilla')).toBeDefined();
    expect(screen.getByText('Alerta Naranja')).toBeDefined();
    expect(screen.getByText('Alerta Roja')).toBeDefined();
    expect(screen.getByText('Emergencia')).toBeDefined();
  });

  it('renders the flood map component', () => {
    expect(screen.getByTestId('flood-map')).toBeDefined();
  });

  it('shows impact data by municipality', () => {
    expect(screen.getByText('Monteria')).toBeDefined();
    expect(screen.getByText('Lorica')).toBeDefined();
    expect(screen.getByText('Tierralta')).toBeDefined();
  });

  it('shows secondary KPIs', () => {
    expect(screen.getByText('72,266')).toBeDefined();
    expect(screen.getByText('4,047')).toBeDefined();
    expect(screen.getByText('22,935')).toBeDefined();
    expect(screen.getByText('546,000')).toBeDefined();
  });

  it('renders the value proposition section', () => {
    expect(screen.getByText(/Ventana de Accion/)).toBeDefined();
    expect(screen.getByText('5-7')).toBeDefined();
    expect(screen.getByText('78K')).toBeDefined();
    expect(screen.getByText('40-60%')).toBeDefined();
  });

  it('has navigation links', () => {
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/comando');
  });

  it('renders the evento historico badge', () => {
    expect(screen.getByText('Evento Historico')).toBeDefined();
  });

  it('renders the satellite comparison section', () => {
    expect(screen.getByText(/Vista Satelital/)).toBeDefined();
    expect(screen.getByText(/Arrastre para comparar/)).toBeDefined();
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it('renders sources section', () => {
    expect(screen.getByText(/Fuentes y referencias/)).toBeDefined();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs.some((h) => h?.includes('science.nasa.gov'))).toBe(true);
    expect(hrefs.some((h) => h?.includes('copernicus'))).toBe(true);
  });
});
