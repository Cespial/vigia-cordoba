import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should apply base classes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('rounded-xl');
    expect(card.className).toContain('border');
    expect(card.className).toContain('bg-white');
    expect(card.className).toContain('shadow-sm');
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('custom-class');
  });

  it('should pass through HTML attributes', () => {
    render(<Card data-testid="my-card">Content</Card>);
    expect(screen.getByTestId('my-card')).toBeInTheDocument();
  });

  it('should have dark mode classes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('dark:bg-zinc-900');
    expect(card.className).toContain('dark:border-zinc-800');
  });

  it('should have padding', () => {
    const { container } = render(<Card>Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain('p-4');
  });
});

describe('CardHeader', () => {
  it('should render children', () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('should have flex layout', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect((container.firstChild as HTMLElement).className).toContain('flex');
  });

  it('should have justify-between', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect((container.firstChild as HTMLElement).className).toContain('justify-between');
  });

  it('should accept custom className', () => {
    const { container } = render(<CardHeader className="extra">Header</CardHeader>);
    expect((container.firstChild as HTMLElement).className).toContain('extra');
  });
});

describe('CardTitle', () => {
  it('should render children', () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('should be an h3 element', () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    expect(container.querySelector('h3')).toBeInTheDocument();
  });

  it('should have font-semibold', () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    expect((container.firstChild as HTMLElement).className).toContain('font-semibold');
  });

  it('should accept custom className', () => {
    const { container } = render(<CardTitle className="big">Title</CardTitle>);
    expect((container.firstChild as HTMLElement).className).toContain('big');
  });
});
