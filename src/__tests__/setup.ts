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

// Mock react-leaflet
vi.mock('react-leaflet', () => {
  const React = require('react');
  return {
    MapContainer: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'map', ...props }, children),
    TileLayer: (props: { url: string; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'tile-layer', 'data-url': props.url }),
    Marker: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'marker', ...props }, children),
    Popup: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'popup', ...props }, children),
    ZoomControl: () => React.createElement('div', { 'data-testid': 'zoom-control' }),
    useMap: () => ({
      fitBounds: vi.fn(),
      setView: vi.fn(),
    }),
  };
});

// Mock leaflet
vi.mock('leaflet', () => ({
  default: {
    divIcon: vi.fn().mockReturnValue({}),
    icon: vi.fn().mockReturnValue({}),
    latLng: vi.fn(),
    map: vi.fn(),
  },
  divIcon: vi.fn().mockReturnValue({}),
  icon: vi.fn().mockReturnValue({}),
}));

// Mock leaflet CSS
vi.mock('leaflet/dist/leaflet.css', () => ({}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
