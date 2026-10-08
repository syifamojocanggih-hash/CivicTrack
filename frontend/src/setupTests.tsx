import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mocks for things that might break in JSDOM, like ResizeObserver
const g: any = globalThis;
g.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock leaflet completely since we don't test map rendering details
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }: any) => <div>{children}</div>,
  Popup: ({ children }: any) => <div>{children}</div>,
  useMap: () => ({ setView: vi.fn(), invalidateSize: vi.fn() }),
  useMapEvents: () => ({}),
}));

vi.mock('leaflet.markercluster', () => ({}));
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({ setView: vi.fn(), on: vi.fn(), remove: vi.fn(), fitBounds: vi.fn(), addLayer: vi.fn(), invalidateSize: vi.fn(), flyToBounds: vi.fn() })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    layerGroup: vi.fn(() => ({ addTo: vi.fn(), clearLayers: vi.fn() })),
    markerClusterGroup: vi.fn(() => ({ addTo: vi.fn(), clearLayers: vi.fn(), addLayer: vi.fn() })),
    divIcon: vi.fn(),
    marker: vi.fn(() => {
      const m: any = {};
      m.bindPopup = vi.fn(() => m);
      m.addTo = vi.fn(() => m);
      m.bindTooltip = vi.fn(() => m);
      m.on = vi.fn(() => m);
      return m;
    }),
  },
  Icon: { Default: { mergeOptions: vi.fn() } },
  icon: vi.fn(),
  divIcon: vi.fn(),
}));
