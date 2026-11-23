import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mocks for things that might break in JSDOM, like ResizeObserver
const g: any = globalThis;
g.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Robust Storage mock for JSDOM and Node 22+
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  writable: true,
  configurable: true,
});
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: storageMock,
    writable: true,
    configurable: true,
  });
}

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
    map: vi.fn(() => ({
      setView: vi.fn(),
      on: vi.fn(),
      remove: vi.fn(),
      fitBounds: vi.fn(),
      addLayer: vi.fn(),
      invalidateSize: vi.fn(),
      flyToBounds: vi.fn(),
      flyTo: vi.fn(),
      panTo: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    layerGroup: vi.fn(() => ({ addTo: vi.fn(), clearLayers: vi.fn() })),
    markerClusterGroup: vi.fn(() => ({ addTo: vi.fn(), clearLayers: vi.fn(), addLayer: vi.fn() })),
    divIcon: vi.fn(),
    latLngBounds: vi.fn((b: any) => b),
    geoJSON: vi.fn(() => ({
      getBounds: () => ({ isValid: () => true }),
      addTo: vi.fn(),
      clearLayers: vi.fn(),
      resetStyle: vi.fn(),
    })),
    circle: vi.fn(() => {
      const c: any = {};
      c.addTo = vi.fn(() => c);
      c.setLatLng = vi.fn(() => c);
      return c;
    }),
    marker: vi.fn(() => {
      const m: any = {};
      m.bindPopup = vi.fn(() => m);
      m.addTo = vi.fn(() => m);
      m.bindTooltip = vi.fn(() => m);
      m.on = vi.fn(() => m);
      m.getLatLng = vi.fn(() => ({ lat: -7.1197, lng: 112.415 }));
      m.setLatLng = vi.fn(() => m);
      return m;
    }),
  },
  Icon: { Default: { mergeOptions: vi.fn() } },
  icon: vi.fn(),
  divIcon: vi.fn(),
}));
