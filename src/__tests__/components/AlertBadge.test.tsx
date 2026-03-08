import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertBadge, AlertDot } from '@/components/ui/AlertBadge';
import { alertLevels } from '@/data/thresholds';

describe('AlertBadge', () => {
  it('should render rojo alert', () => {
    render(<AlertBadge alert={alertLevels.rojo} />);
    expect(screen.getByText('Alerta Roja')).toBeInTheDocument();
  });

  it('should render naranja alert', () => {
    render(<AlertBadge alert={alertLevels.naranja} />);
    expect(screen.getByText('Alerta Naranja')).toBeInTheDocument();
  });

  it('should render amarillo alert', () => {
    render(<AlertBadge alert={alertLevels.amarillo} />);
    expect(screen.getByText('Alerta Amarilla')).toBeInTheDocument();
  });

  it('should render verde alert', () => {
    render(<AlertBadge alert={alertLevels.verde} />);
    expect(screen.getByText('Sin Alerta')).toBeInTheDocument();
  });

  it('should apply sm size by default', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-xs');
  });

  it('should apply md size when specified', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} size="md" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-sm');
  });

  it('should apply lg size when specified', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} size="lg" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-base');
  });

  it('should have a pulse animation dot', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} />);
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toBeInTheDocument();
  });

  it('should apply correct color class for rojo', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-red-100');
  });

  it('should apply correct color class for naranja', () => {
    const { container } = render(<AlertBadge alert={alertLevels.naranja} />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-orange-100');
  });

  it('should apply correct color class for amarillo', () => {
    const { container } = render(<AlertBadge alert={alertLevels.amarillo} />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-yellow-100');
  });

  it('should apply correct color class for verde', () => {
    const { container } = render(<AlertBadge alert={alertLevels.verde} />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-green-100');
  });

  it('should be a span element', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} />);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('should have rounded-full class', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} />);
    expect((container.firstChild as HTMLElement).className).toContain('rounded-full');
  });
});

describe('AlertDot', () => {
  it('should render with default size', () => {
    const { container } = render(<AlertDot level="rojo" />);
    const dot = container.firstChild as HTMLElement;
    expect(dot.style.width).toBe('12px');
    expect(dot.style.height).toBe('12px');
  });

  it('should render with custom size', () => {
    const { container } = render(<AlertDot level="rojo" size={20} />);
    const dot = container.firstChild as HTMLElement;
    expect(dot.style.width).toBe('20px');
    expect(dot.style.height).toBe('20px');
  });

  it('should apply correct color for each level', () => {
    const levels = ['rojo', 'naranja', 'amarillo', 'verde'] as const;
    const expectedColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

    levels.forEach((level, i) => {
      const { container } = render(<AlertDot level={level} />);
      expect((container.firstChild as HTMLElement).className).toContain(expectedColors[i]);
    });
  });

  it('should have animate-pulse class', () => {
    const { container } = render(<AlertDot level="rojo" />);
    expect((container.firstChild as HTMLElement).className).toContain('animate-pulse');
  });

  it('should have rounded-full class', () => {
    const { container } = render(<AlertDot level="verde" />);
    expect((container.firstChild as HTMLElement).className).toContain('rounded-full');
  });
});
