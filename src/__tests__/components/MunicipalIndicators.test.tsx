import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MunicipalIndicators from '@/components/municipality/MunicipalIndicators';

// Mock all data imports
vi.mock('@/data/education-institutions.json', () => ({
  default: [
    { municipality: 'Montería', count: 450, rural: 280, urban: 170, totalStudents: 125000 },
    { municipality: 'Lorica', count: 180, rural: 120, urban: 60, totalStudents: 35000 },
  ],
}));

vi.mock('@/data/health-institutions.json', () => ({
  default: [
    { municipality: 'MONTERÍA', total: 320, hospitals: 12, centers: 308 },
    { municipality: 'LORICA', total: 45, hospitals: 3, centers: 42 },
  ],
}));

vi.mock('@/data/nbi-data.json', () => ({
  default: [
    { municipality: 'Montería', nbi_total: 36.9, nbi_urban: 27.2, nbi_rural: 63.8 },
    { municipality: 'Lorica', nbi_total: 62.5, nbi_urban: 45.3, nbi_rural: 74.1 },
  ],
}));

vi.mock('@/data/agriculture-data.json', () => ({
  default: [
    { municipality: 'MONTERIA', total_ha: 15000, main_crops: ['MAIZ', 'ARROZ', 'YUCA'], total_production_tons: 85000 },
    { municipality: 'LORICA', total_ha: 8500, main_crops: ['ARROZ', 'YUCA'], total_production_tons: 42000 },
  ],
}));

vi.mock('@/data/livestock-data.json', () => ({
  default: [
    { municipality: 'Montería', cattle_heads: 352000, area_pasture_ha: 85000 },
    { municipality: 'Lorica', cattle_heads: 125000, area_pasture_ha: 45000 },
  ],
}));

vi.mock('@/data/ungrd-emergencies.json', () => ({
  default: [
    { municipality: 'MONTERIA', affected: 2500, deaths: 0, destroyed_homes: 5, damaged_homes: 100 },
    { municipality: 'MONTERIA', affected: 1800, deaths: 0, destroyed_homes: 3, damaged_homes: 80 },
  ],
}));

vi.mock('@/data/ideam-stations.json', () => ({
  default: [
    { municipality: 'MONTERIA', active: true },
    { municipality: 'MONTERIA', active: true },
    { municipality: 'MONTERIA', active: false },
    { municipality: 'LORICA', active: true },
  ],
}));

describe('MunicipalIndicators', () => {
  it('should render for Montería', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText('Vulnerabilidad Socioeconómica')).toBeInTheDocument();
  });

  it('should show NBI data', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText('36.9%')).toBeInTheDocument();
    expect(screen.getByText('NBI Total')).toBeInTheDocument();
  });

  it('should show NBI urban and rural', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText('27.2%')).toBeInTheDocument();
    expect(screen.getByText('63.8%')).toBeInTheDocument();
  });

  it('should show education data', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText('Sedes Educativas')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
  });

  it('should show health data', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText('Centros de Salud')).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
  });

  it('should show livestock data', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText('Ganadería')).toBeInTheDocument();
    expect(screen.getByText('352.000')).toBeInTheDocument();
  });

  it('should show agriculture data', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText('Área Agrícola')).toBeInTheDocument();
  });

  it('should show IDEAM station count', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText('Capacidad de Monitoreo')).toBeInTheDocument();
  });

  it('should show emergency history', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText('Historial de Impacto')).toBeInTheDocument();
  });

  it('should show total affected from emergencies', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    // 2500 + 1800 = 4300
    expect(screen.getByText('4.300')).toBeInTheDocument();
  });

  it('should render for high-vulnerability municipality', () => {
    render(<MunicipalIndicators municipalityName="Lorica" municipalitySlug="lorica" />);
    expect(screen.getByText('62.5%')).toBeInTheDocument();
    // NBI > 50 should show vulnerability warning
    expect(screen.getByText(/Alta vulnerabilidad/)).toBeInTheDocument();
  });

  it('should render infrastructure exposed section', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText('Infraestructura Expuesta')).toBeInTheDocument();
  });

  it('should show rural/urban breakdown for education', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText(/Rural: 280/)).toBeInTheDocument();
    expect(screen.getByText(/Urbano: 170/)).toBeInTheDocument();
  });

  it('should show hospitals count for health', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText(/Hospitales: 12/)).toBeInTheDocument();
  });

  it('should show main crops', () => {
    render(<MunicipalIndicators municipalityName="Montería" municipalitySlug="monteria" />);
    expect(screen.getByText(/MAIZ/)).toBeInTheDocument();
  });

  it('should handle unknown municipality gracefully', () => {
    render(<MunicipalIndicators municipalityName="DesconocidoXYZ" municipalitySlug="desconocido" />);
    // Should render dashes for missing data
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });
});
