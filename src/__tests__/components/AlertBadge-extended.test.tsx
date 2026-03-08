import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertBadge, AlertDot } from '@/components/ui/AlertBadge';
import { alertLevels } from '@/data/thresholds';

describe('AlertBadge — All Sizes', () => {
  const levels = ['rojo', 'naranja', 'amarillo', 'verde'] as const;
  const sizes = ['sm', 'md', 'lg'] as const;

  levels.forEach(level => {
    sizes.forEach(size => {
      it(`should render ${level} badge in size ${size}`, () => {
        render(<AlertBadge alert={alertLevels[level]} size={size} />);
        expect(screen.getByText(alertLevels[level].label)).toBeInTheDocument();
      });
    });
  });

  it('sm should have text-xs class', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} size="sm" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('text-xs');
  });

  it('md should have text-sm class', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} size="md" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('text-sm');
  });

  it('lg should have text-base class', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} size="lg" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('text-base');
  });

  it('should default to sm size', () => {
    const { container } = render(<AlertBadge alert={alertLevels.verde} />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('text-xs');
  });
});

describe('AlertBadge — Color Classes', () => {
  it('rojo should have red classes', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('red');
  });

  it('naranja should have orange classes', () => {
    const { container } = render(<AlertBadge alert={alertLevels.naranja} />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('orange');
  });

  it('amarillo should have yellow classes', () => {
    const { container } = render(<AlertBadge alert={alertLevels.amarillo} />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('yellow');
  });

  it('verde should have green classes', () => {
    const { container } = render(<AlertBadge alert={alertLevels.verde} />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('green');
  });
});

describe('AlertBadge — Structure', () => {
  it('should have a pulsing dot', () => {
    const { container } = render(<AlertBadge alert={alertLevels.rojo} />);
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toBeInTheDocument();
  });

  it('should have rounded-full class', () => {
    const { container } = render(<AlertBadge alert={alertLevels.verde} />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('rounded-full');
  });

  it('should have border class', () => {
    const { container } = render(<AlertBadge alert={alertLevels.amarillo} />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('border');
  });

  it('should have font-medium class', () => {
    const { container } = render(<AlertBadge alert={alertLevels.naranja} />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('font-medium');
  });
});

describe('AlertDot — All Levels', () => {
  const levels = ['rojo', 'naranja', 'amarillo', 'verde'] as const;

  levels.forEach(level => {
    it(`should render ${level} dot`, () => {
      const { container } = render(<AlertDot level={level} />);
      const dot = container.querySelector('span');
      expect(dot).toBeInTheDocument();
    });
  });

  it('should have default size of 12px', () => {
    const { container } = render(<AlertDot level="rojo" />);
    const dot = container.querySelector('span');
    expect(dot?.style.width).toBe('12px');
    expect(dot?.style.height).toBe('12px');
  });

  it('should accept custom size', () => {
    const { container } = render(<AlertDot level="verde" size={20} />);
    const dot = container.querySelector('span');
    expect(dot?.style.width).toBe('20px');
    expect(dot?.style.height).toBe('20px');
  });

  it('should render small dot (size=8)', () => {
    const { container } = render(<AlertDot level="amarillo" size={8} />);
    const dot = container.querySelector('span');
    expect(dot?.style.width).toBe('8px');
  });

  it('should render large dot (size=16)', () => {
    const { container } = render(<AlertDot level="naranja" size={16} />);
    const dot = container.querySelector('span');
    expect(dot?.style.width).toBe('16px');
  });

  it('should have animate-pulse class', () => {
    const { container } = render(<AlertDot level="rojo" />);
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toBeInTheDocument();
  });

  it('should have rounded-full class', () => {
    const { container } = render(<AlertDot level="verde" />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeInTheDocument();
  });
});
