import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIRouteModal } from './AIRouteModal';

// Mock Leaflet as it requires browser canvas/DOM APIs
vi.mock('leaflet', () => {
  const mockLayerGroup = {
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn(),
    removeLayer: vi.fn(),
  };

  const mockPolyline = {
    addTo: vi.fn().mockReturnThis(),
    bindTooltip: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    bringToFront: vi.fn().mockReturnThis(),
    getBounds: vi.fn().mockReturnValue({
      extend: vi.fn(),
      pad: vi.fn().mockReturnThis(),
    }),
    getLatLngs: vi.fn().mockReturnValue([[-7.1195, 112.4154], [-7.1158, 112.4182]]),
  };

  const mockMarker = {
    addTo: vi.fn().mockReturnThis(),
    bindTooltip: vi.fn().mockReturnThis(),
    setLatLng: vi.fn(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
  };

  const mockCircle = {
    addTo: vi.fn().mockReturnThis(),
    bindTooltip: vi.fn().mockReturnThis(),
  };

  const mockMap = {
    setView: vi.fn(),
    fitBounds: vi.fn(),
    flyTo: vi.fn(),
    invalidateSize: vi.fn(),
    remove: vi.fn(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
  };

  return {
    default: {
      map: vi.fn().mockReturnValue(mockMap),
      tileLayer: vi.fn().mockReturnValue({ addTo: vi.fn() }),
      layerGroup: vi.fn().mockReturnValue(mockLayerGroup),
      polyline: vi.fn().mockReturnValue(mockPolyline),
      marker: vi.fn().mockReturnValue(mockMarker),
      circle: vi.fn().mockReturnValue(mockCircle),
      divIcon: vi.fn().mockReturnValue({}),
      control: { zoom: vi.fn().mockReturnValue({ addTo: vi.fn() }) },
      latLngBounds: vi.fn().mockReturnValue({ pad: vi.fn().mockReturnThis() }),
    },
  };
});

describe('AIRouteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 101,
          proyek_id: 25,
          nama_rute: 'Jalur Arteri Alun-Alun ➔ Jl. Basuki Rahmad ➔ Stasiun Lamongan',
          prioritas: 'utama',
          estimasi_jarak_km: 3.8,
          estimasi_waktu_menit: 11,
          alasan_rekomendasi: 'Jalur arteri beraspal lebar menghindari penutupan proyek.',
          geografis_terverifikasi: true,
          koordinat_rute: [
            [-7.1195, 112.4154],
            [-7.1180, 112.4160],
            [-7.1158, 112.4182],
          ],
        },
        {
          id: 102,
          proyek_id: 25,
          nama_rute: 'Jalan Lingkar Luar Bypass',
          prioritas: 'kedua',
          estimasi_jarak_km: 5.2,
          estimasi_waktu_menit: 15,
          alasan_rekomendasi: 'Jalur lingkar sekunder pengurai kepadatan.',
          geografis_terverifikasi: true,
          koordinat_rute: [
            [-7.1210, 112.4140],
            [-7.1230, 112.4160],
            [-7.1158, 112.4182],
          ],
        },
        {
          id: 103,
          proyek_id: 25,
          nama_rute: 'Jalur Pintas Pemukiman Gang Kenanga',
          prioritas: 'tambahan',
          estimasi_jarak_km: 2.5,
          estimasi_waktu_menit: 7,
          alasan_rekomendasi: 'Akses cepat khusus roda dua.',
          geografis_terverifikasi: true,
          koordinat_rute: [
            [-7.1190, 112.4150],
            [-7.1170, 112.4170],
            [-7.1158, 112.4182],
          ],
        },
      ],
    });
  });

  it('renders modal header and 3 priority route cards with verified OSM badges', async () => {
    render(
      <AIRouteModal
        isOpen={true}
        onClose={() => {}}
        projectName="Renovasi Alun-Alun & Taman Centennial Lamongan"
        project={{
          id: 25,
          nama_proyek: 'Renovasi Alun-Alun & Taman Centennial Lamongan',
          kategori: 'taman',
          deskripsi: 'Proyek renovasi',
          latitude: -7.1195,
          longitude: 112.4154,
          progres_persen: 60,
          anggaran: 2500000000,
          wilayah_id: 1,
          nama_wilayah: 'Lamongan',
          status: 'berjalan',
        }}
      />
    );

    // Header title
    expect(screen.getByText(/Visualisasi & Generator Rute Alternatif Cerdas/i)).toBeInTheDocument();

    // Route cards
    await waitFor(() => {
      expect(screen.getByText(/Prioritas 1: Rekomendasi Utama/i)).toBeInTheDocument();
      expect(screen.getByText(/Prioritas 2: Jalur Lingkar/i)).toBeInTheDocument();
      expect(screen.getByText(/Prioritas 3: Jalur Pintas/i)).toBeInTheDocument();
    });

    // Badge Terverifikasi Peta OSM should be visible
    const verifiedBadges = await screen.findAllByText(/Terverifikasi Peta OSM/i);
    expect(verifiedBadges.length).toBeGreaterThan(0);

    // "Peta Rute Tidak Tersedia" banner should NOT be displayed when valid coordinates exist
    expect(screen.queryByText(/Peta Rute Tidak Tersedia/i)).not.toBeInTheDocument();
  });

  it('allows clicking presets to change origin and destination', async () => {
    render(
      <AIRouteModal
        isOpen={true}
        onClose={() => {}}
        projectName="Renovasi Alun-Alun Lamongan"
        project={{
          id: 25,
          nama_proyek: 'Renovasi Alun-Alun Lamongan',
          kategori: 'taman',
          deskripsi: 'Proyek renovasi',
          latitude: -7.1195,
          longitude: 112.4154,
          progres_persen: 60,
          anggaran: 2500000000,
          wilayah_id: 1,
          nama_wilayah: 'Lamongan',
          status: 'berjalan',
        }}
      />
    );

    const user = userEvent.setup();
    const presetAlunAlunBtn = screen.getByRole('button', { name: /Alun-Alun ➔ Stasiun/i });
    await user.click(presetAlunAlunBtn);

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    const originInput = inputs[0];
    const destInput = inputs[1];

    expect(originInput.value).toBe('Alun-Alun Lamongan');
    expect(destInput.value).toBe('Stasiun Lamongan');
  });

  it('correctly derives contextual corridor endpoints and presets for regional road projects', async () => {
    render(
      <AIRouteModal
        isOpen={true}
        onClose={() => {}}
        projectName="Peningkatan Jalan Sukodadi - Sumberwudi / Buluadedi (JAMULA)"
        project={{
          id: 1,
          nama_proyek: 'Peningkatan Jalan Sukodadi - Sumberwudi / Buluadedi (JAMULA)',
          kategori: 'jalan',
          deskripsi: 'Proyek pelebaran jalan',
          latitude: -7.1152,
          longitude: 112.3324,
          progres_persen: 45,
          anggaran: 5000000000,
          wilayah_id: 2,
          nama_wilayah: 'Kecamatan Sukodadi',
          status: 'berjalan',
        }}
      />
    );

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    const originInput = inputs[0];
    const destInput = inputs[1];

    expect(originInput.value).toBe('Simpang Sukodadi');
    expect(destInput.value).toBe('Simpang Sumberwudi');

    // Preset button for the road corridor should exist
    expect(screen.getByRole('button', { name: /Sukodadi ➔ Sumberwudi/i })).toBeInTheDocument();
  });

  it('renders simulation controls and starts vehicle simulation without crashing', async () => {
    render(
      <AIRouteModal
        isOpen={true}
        onClose={() => {}}
        projectName="Renovasi Alun-Alun Lamongan"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Simulasi Kendaraan/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const simBtn = screen.getByRole('button', { name: /Simulasi Kendaraan/i });
    await user.click(simBtn);

    // Simulation toggle to "Hentikan"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Hentikan/i })).toBeInTheDocument();
    });
  });

  it('correctly resolves landmarks and generates continuous clean detour paths', async () => {
    const { resolvePlaceCoords, isPolylineValid, generateCleanDetourPath, ensureWaypointsSpan } = await import('../utils/aiRouteUtils');

    const projectCenter: [number, number] = [-7.1205, 112.4155];
    const pensCoords = resolvePlaceCoords('PENS Lamongan', projectCenter, true);
    const namiraCoords = resolvePlaceCoords('RS Namira Lamongan', projectCenter, false);

    expect(pensCoords).toEqual([-7.1265, 112.3965]);
    expect(namiraCoords).toEqual([-7.1350, 112.4280]);

    // Test polyline validation
    // 1. Cut through project center should be INVALID
    const cuttingCoords: [number, number][] = [
      pensCoords,
      projectCenter, // right through center
      namiraCoords,
    ];
    expect(isPolylineValid(cuttingCoords, projectCenter, pensCoords, namiraCoords, 240)).toBe(false);

    // 2. Teleport jump (> 450m) should be INVALID
    const jumpingCoords: [number, number][] = [
      [-7.1200, 112.4100],
      [-7.1400, 112.4300], // > 2km jump
    ];
    expect(isPolylineValid(jumpingCoords, projectCenter, pensCoords, namiraCoords, 240)).toBe(false);

    // 3. Clean detour path should be VALID and connect start to end
    const detourPath = generateCleanDetourPath(pensCoords, namiraCoords, projectCenter, 0);
    expect(detourPath.length).toBeGreaterThanOrEqual(6);
    expect(detourPath[0]).toEqual(pensCoords);
    expect(detourPath[detourPath.length - 1]).toEqual(namiraCoords);
    expect(isPolylineValid(detourPath, projectCenter, pensCoords, namiraCoords, 240)).toBe(true);

    // 4. Ensure waypoints span from origin to destination
    const spanned = ensureWaypointsSpan(['Jalan Gatotkaca', 'Jalan Kresna'], 'PENS Lamongan', 'RS Namira Lamongan');
    expect(spanned[0]).toBe('PENS Lamongan');
    expect(spanned[spanned.length - 1]).toBe('RS Namira Lamongan');
    expect(spanned).toContain('Jalan Gatotkaca');
  });

  it('renders "Pilih di Peta" and allows swapping origin and destination via "Tukar A & B"', async () => {
    const user = userEvent.setup();
    render(
      <AIRouteModal
        isOpen={true}
        onClose={vi.fn()}
        projectName="Peningkatan Jalan Sukodadi - Sumberwudi (JAMULA)"
        project={{
          id: 1,
          nama_proyek: 'Peningkatan Jalan Sukodadi - Sumberwudi (JAMULA)',
          nama_wilayah: 'Kecamatan Sukodadi',
          latitude: -7.135,
          longitude: 112.33,
        } as any}
      />
    );

    // Verify "Pilih di Peta" buttons exist
    const pickButtons = screen.getAllByRole('button', { name: /Pilih di Peta/i });
    expect(pickButtons.length).toBeGreaterThanOrEqual(2);

    // Clicking Origin "Pilih di Peta" activates recording mode
    await user.click(pickButtons[0]);
    expect(screen.getByText(/Merekam.../i)).toBeInTheDocument();
    expect(screen.getByText(/Klik lokasi pada peta untuk menentukan Titik Awal/i)).toBeInTheDocument();

    // Verify "Tukar A & B" button exists and swaps origin & destination
    const swapBtn = screen.getByRole('button', { name: /Tukar A & B/i });
    expect(swapBtn).toBeInTheDocument();
    await user.click(swapBtn);
    expect(screen.getByText(/Titik awal dan tujuan berhasil ditukar!/i)).toBeInTheDocument();
  });

  it('resolves nearest landmark names and coordinates using getNearestPlaceName', async () => {
    const { getNearestPlaceName } = await import('../utils/aiRouteUtils');
    const projectCenter: [number, number] = [-7.135, 112.33];

    // Click near Masjid Agung Lamongan
    const masjidAgungName = getNearestPlaceName([-7.1202, 112.4147], projectCenter);
    expect(masjidAgungName.toLowerCase()).toContain('masjid agung');

    // Click near Masjid Namira Lamongan
    const masjidNamiraName = getNearestPlaceName([-7.1585, 112.4124], projectCenter);
    expect(masjidNamiraName.toLowerCase()).toContain('masjid namira');

    // Arbitrary coordinates
    const arbitraryName = getNearestPlaceName([-7.1400, 112.3800], projectCenter);
    expect(arbitraryName).toContain('Titik Peta');
  });
});

