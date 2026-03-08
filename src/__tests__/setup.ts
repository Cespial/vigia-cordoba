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
    MapContainer: ({ children, center, zoom, zoomControl, maxBounds, minZoom, maxZoom, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'map', style: props.style as React.CSSProperties }, children),
    TileLayer: (props: { url: string; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'tile-layer', 'data-url': props.url }),
    Marker: ({ children, position, icon, ...props }: { children?: React.ReactNode; position?: unknown; icon?: unknown; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'marker' }, children),
    Popup: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'popup', className }, children),
    ZoomControl: () => React.createElement('div', { 'data-testid': 'zoom-control' }),
    GeoJSON: ({ data, style, onEachFeature, ...props }: { data: unknown; style?: unknown; onEachFeature?: unknown; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'geojson' }),
    CircleMarker: ({ children, center, radius, ...props }: { children?: React.ReactNode; center?: unknown; radius?: unknown; [key: string]: unknown }) =>
      React.createElement('div', { 'data-testid': 'circle-marker' }, children),
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
