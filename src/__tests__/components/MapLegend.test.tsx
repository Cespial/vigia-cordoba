import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MapLegend from '@/components/map/MapLegend';

describe('MapLegend', () => {
  it('should render the Leyenda title', () => {
    render(<MapLegend />);
    expect(screen.getByText('Leyenda')).toBeInTheDocument();
  });

  it('should show alert levels section', () => {
    render(<MapLegend />);
    expect(screen.getByText('Niveles de alerta')).toBeInTheDocument();
  });

  it('should show all four alert levels', () => {
    render(<MapLegend />);
    expect(screen.getByText('Alerta Roja')).toBeInTheDocument();
    expect(screen.getByText('Alerta Naranja')).toBeInTheDocument();
    expect(screen.getByText('Alerta Amarilla')).toBeInTheDocument();
    expect(screen.getByText('Sin Alerta')).toBeInTheDocument();
  });

  it('should show priority section', () => {
    render(<MapLegend />);
    expect(screen.getByText('Prioridad')).toBeInTheDocument();
  });

  it('should show Alta, Media, Baja priorities', () => {
    render(<MapLegend />);
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Baja')).toBeInTheDocument();
  });

  it('should show cuencas section', () => {
    render(<MapLegend />);
    expect(screen.getByText('Cuencas')).toBeInTheDocument();
  });

  it('should show all cuenca names', () => {
    render(<MapLegend />);
    expect(screen.getByText('Sinú Alta')).toBeInTheDocument();
    expect(screen.getByText('Sinú Media')).toBeInTheDocument();
    expect(screen.getByText('Sinú Baja')).toBeInTheDocument();
    expect(screen.getByText('San Jorge Alta')).toBeInTheDocument();
    expect(screen.getByText('San Jorge Baja')).toBeInTheDocument();
    expect(screen.getByText('Canalete')).toBeInTheDocument();
  });

  it('should show map layers section', () => {
    render(<MapLegend />);
    expect(screen.getByText('Capas')).toBeInTheDocument();
  });

  it('should show monitoring point in layers', () => {
    render(<MapLegend />);
    expect(screen.getByText('Punto de monitoreo')).toBeInTheDocument();
  });

  it('should be collapsible', () => {
    render(<MapLegend />);
    const button = screen.getByText('Leyenda').closest('button');
    expect(button).toBeDefined();
    fireEvent.click(button!);
    // After collapse, the sections should disappear
    expect(screen.queryByText('Niveles de alerta')).not.toBeInTheDocument();
  });

  it('should expand when collapsed', () => {
    render(<MapLegend />);
    const button = screen.getByText('Leyenda').closest('button');
    // Collapse
    fireEvent.click(button!);
    expect(screen.queryByText('Cuencas')).not.toBeInTheDocument();
    // Expand
    fireEvent.click(button!);
    expect(screen.getByText('Cuencas')).toBeInTheDocument();
  });

  it('should have positioning classes', () => {
    const { container } = render(<MapLegend />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('absolute');
    expect(wrapper.className).toContain('z-10');
  });
});
