import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => {
    const React = require('react');
    return React.createElement('a', { href, ...props }, children);
  },
}));

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<{ default: React.ComponentType }>) => {
    const React = require('react');
    const Component = React.lazy(loader);
    return function DynamicComponent(props: Record<string, unknown>) {
      return React.createElement(
        React.Suspense,
        { fallback: React.createElement('div', null, 'Loading...') },
        React.createElement(Component, props)
      );
    };
  },
}));

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(),
    Marker: vi.fn(),
    NavigationControl: vi.fn(),
    ScaleControl: vi.fn(),
  },
  Map: vi.fn(),
}));

// Mock react-map-gl/mapbox
vi.mock('react-map-gl/mapbox', () => {
  const React = require('react');
  return {
    default: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'map', ...props }, children),
    Marker: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'marker', ...props }, children),
    Popup: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'popup', ...props }, children),
    NavigationControl: () => React.createElement('div', { 'data-testid': 'nav-control' }),
    ScaleControl: () => React.createElement('div', { 'data-testid': 'scale-control' }),
  };
});

// Mock mapbox CSS
vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
