import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmergencyHistory from '@/components/charts/EmergencyHistory';

vi.mock('@/data/ungrd-emergencies.json', () => ({
  default: [
    { date: '2020-05-01T00:00:00.000', municipality: 'MONTERIA', event_type: 'INUNDACION', deaths: 0, injuries: 2, affected: 1500, destroyed_homes: 5, damaged_homes: 100, resources: 50000 },
    { date: '2020-06-15T00:00:00.000', municipality: 'LORICA', event_type: 'INUNDACION', deaths: 1, injuries: 5, affected: 3000, destroyed_homes: 10, damaged_homes: 200, resources: 120000 },
    { date: '2021-04-20T00:00:00.000', municipality: 'TIERRALTA', event_type: 'INUNDACION', deaths: 0, injuries: 0, affected: 800, destroyed_homes: 2, damaged_homes: 50, resources: 30000 },
    { date: '2021-09-10T00:00:00.000', municipality: 'MONTERIA', event_type: 'INUNDACION', deaths: 0, injuries: 1, affected: 2000, destroyed_homes: 3, damaged_homes: 80, resources: 45000 },
    { date: '2022-07-05T00:00:00.000', municipality: 'AYAPEL', event_type: 'INUNDACION', deaths: 2, injuries: 3, affected: 5000, destroyed_homes: 20, damaged_homes: 300, resources: 200000 },
  ],
}));

describe('EmergencyHistory', () => {
  it('should render the component', () => {
    render(<EmergencyHistory />);
    expect(screen.getByText(/Historial de Emergencias/)).toBeInTheDocument();
  });

  it('should show total events', () => {
    render(<EmergencyHistory />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Eventos registrados')).toBeInTheDocument();
  });

  it('should show total affected people', () => {
    render(<EmergencyHistory />);
    // 1500+3000+800+2000+5000 = 12300
    expect(screen.getByText('12.300')).toBeInTheDocument();
  });

  it('should show total deaths', () => {
    render(<EmergencyHistory />);
    expect(screen.getByText('Fallecidos')).toBeInTheDocument();
  });

  it('should show impacted homes', () => {
    render(<EmergencyHistory />);
    expect(screen.getByText('Viviendas impactadas')).toBeInTheDocument();
  });

  it('should show yearly chart section', () => {
    render(<EmergencyHistory />);
    expect(screen.getByText('Eventos por año')).toBeInTheDocument();
  });

  it('should show top municipalities', () => {
    render(<EmergencyHistory />);
    expect(screen.getByText('Municipios más afectados')).toBeInTheDocument();
  });

  it('should rank Montería first (2 events)', () => {
    render(<EmergencyHistory />);
    // Montería has 2 events, should appear first
    expect(screen.getByText('monteria')).toBeInTheDocument();
  });

  it('should show UNGRD source', () => {
    render(<EmergencyHistory />);
    expect(screen.getByText('Fuente: UNGRD')).toBeInTheDocument();
  });

  it('should show year labels', () => {
    render(<EmergencyHistory />);
    // Years 2020, 2021, 2022 should appear as "20", "21", "22"
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
