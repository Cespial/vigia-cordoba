import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '@/components/ui/Skeleton';

describe('Skeleton', () => {
  it('should render', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have animate-pulse', () => {
    const { container } = render(<Skeleton />);
    expect((container.firstChild as HTMLElement).className).toContain('animate-pulse');
  });

  it('should have rounded-md', () => {
    const { container } = render(<Skeleton />);
    expect((container.firstChild as HTMLElement).className).toContain('rounded-md');
  });

  it('should accept custom className', () => {
    const { container } = render(<Skeleton className="h-20 w-40" />);
    expect((container.firstChild as HTMLElement).className).toContain('h-20');
    expect((container.firstChild as HTMLElement).className).toContain('w-40');
  });

  it('should have background color', () => {
    const { container } = render(<Skeleton />);
    expect((container.firstChild as HTMLElement).className).toContain('bg-zinc-200');
  });

  it('should have dark mode background', () => {
    const { container } = render(<Skeleton />);
    expect((container.firstChild as HTMLElement).className).toContain('dark:bg-zinc-700');
  });
});
