import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LayerControl, { type MapLayer } from '@/components/map/LayerControl';

const mockLayers: MapLayer[] = [
  { id: 'boundaries', label: 'Límites municipales', color: '#60a5fa', visible: true },
  { id: 'rivers', label: 'Red hídrica', color: '#38bdf8', visible: true },
  { id: 'stations', label: 'Estaciones IDEAM', color: '#10b981', visible: false },
  { id: 'alerts', label: 'Alertas municipales', color: '#f97316', visible: true },
  { id: 'risk', label: 'Riesgo', color: '#a855f7', visible: false },
];

describe('LayerControl', () => {
  it('should render the Capas button', () => {
    render(<LayerControl layers={mockLayers} onToggle={vi.fn()} />);
    expect(screen.getByText('Capas')).toBeInTheDocument();
  });

  it('should show layer list when clicked', () => {
    render(<LayerControl layers={mockLayers} onToggle={vi.fn()} />);
    fireEvent.click(screen.getByText('Capas'));
    expect(screen.getByText('Límites municipales')).toBeInTheDocument();
    expect(screen.getByText('Red hídrica')).toBeInTheDocument();
    expect(screen.getByText('Estaciones IDEAM')).toBeInTheDocument();
    expect(screen.getByText('Alertas municipales')).toBeInTheDocument();
    expect(screen.getByText('Riesgo')).toBeInTheDocument();
  });

  it('should call onToggle when a layer is clicked', () => {
    const onToggle = vi.fn();
    render(<LayerControl layers={mockLayers} onToggle={onToggle} />);
    fireEvent.click(screen.getByText('Capas'));
    fireEvent.click(screen.getByText('Red hídrica'));
    expect(onToggle).toHaveBeenCalledWith('rivers');
  });

  it('should show header text', () => {
    render(<LayerControl layers={mockLayers} onToggle={vi.fn()} />);
    fireEvent.click(screen.getByText('Capas'));
    expect(screen.getByText('Capas del mapa')).toBeInTheDocument();
  });

  it('should toggle expanded state', () => {
    render(<LayerControl layers={mockLayers} onToggle={vi.fn()} />);
    fireEvent.click(screen.getByText('Capas'));
    expect(screen.getByText('Límites municipales')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Capas'));
    expect(screen.queryByText('Límites municipales')).not.toBeInTheDocument();
  });

  it('should render with empty layers', () => {
    render(<LayerControl layers={[]} onToggle={vi.fn()} />);
    fireEvent.click(screen.getByText('Capas'));
    expect(screen.getByText('Capas del mapa')).toBeInTheDocument();
  });

  it('should show correct number of layers', () => {
    render(<LayerControl layers={mockLayers} onToggle={vi.fn()} />);
    fireEvent.click(screen.getByText('Capas'));
    const buttons = screen.getAllByRole('button');
    // 1 toggle button + 5 layer buttons
    expect(buttons.length).toBe(6);
  });

  it('should call onToggle when risk layer is clicked', () => {
    const onToggle = vi.fn();
    render(<LayerControl layers={mockLayers} onToggle={onToggle} />);
    fireEvent.click(screen.getByText('Capas'));
    fireEvent.click(screen.getByText('Riesgo'));
    expect(onToggle).toHaveBeenCalledWith('risk');
  });

  it('should show color indicators for layers', () => {
    const { container } = render(<LayerControl layers={mockLayers} onToggle={vi.fn()} />);
    fireEvent.click(screen.getByText('Capas'));
    const colorSpans = container.querySelectorAll('[style*="background-color"]');
    expect(colorSpans.length).toBeGreaterThan(0);
  });
});
