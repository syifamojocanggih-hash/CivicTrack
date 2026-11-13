import { describe, it, expect } from 'vitest';
import {
  isPointInPolygon,
  validateCoordinatesInKecamatan,
  findWilayahByCoordinates,
  findCoordinatesByDesa,
  findCoordinatesByKecamatan,
} from './spatial';

describe('spatial utils', () => {
  describe('isPointInPolygon', () => {
    // Simple square polygon from [0,0] to [10,10]
    const squarePolygon: [number, number][] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];

    it('should return true for a point strictly inside the polygon', () => {
      expect(isPointInPolygon([5, 5], squarePolygon)).toBe(true);
    });

    it('should return false for a point strictly outside the polygon', () => {
      expect(isPointInPolygon([15, 15], squarePolygon)).toBe(false);
      expect(isPointInPolygon([-5, 5], squarePolygon)).toBe(false);
    });

    it('should return false for a bounding box optimization check (far outside)', () => {
      expect(isPointInPolygon([100, 100], squarePolygon)).toBe(false);
    });

    it('should handle small polygons gracefully (less than 3 points)', () => {
      expect(isPointInPolygon([5, 5], [[0, 0], [10, 10]])).toBe(false);
    });
  });

  describe('validateCoordinatesInKecamatan', () => {
    it('should return valid if matched kecamatan found and point is inside', () => {
      // Data dummy: Kecamatan Sukorame
      const result = validateCoordinatesInKecamatan(-7.35, 112.10, 'Sukorame');
      expect(result.isValid).toBe(true);
      expect(result.message).toContain('berada di dalam batas wilayah');
      expect(result.matchedKecamatan).toBe('Kecamatan Sukorame');
    });

    it('should return invalid if matched kecamatan found but point is outside', () => {
      // Titik ngawur (jauh dari Sukorame)
      const result = validateCoordinatesInKecamatan(-1.0, 100.0, 'Sukorame');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('berada di luar batas poligon');
      expect(result.matchedKecamatan).toBe('Kecamatan Sukorame');
    });

    it('should allow (isValid=true) as fallback if kecamatan not found in WILAYAH_DATA', () => {
      const result = validateCoordinatesInKecamatan(-8.43, 114.33, 'Kecamatan AntahBerantah');
      expect(result.isValid).toBe(true);
      expect(result.message).toContain('Wilayah umum tanpa poligon khusus');
      expect(result.matchedKecamatan).toBeUndefined();
    });
  });

  describe('findWilayahByCoordinates', () => {
    it('identifies kecamatan and desa for Lamongan city coordinates', () => {
      // Near Lamongan Kota center [-7.1197, 112.4150]
      const result = findWilayahByCoordinates(-7.1197, 112.4150);
      expect(result.kecamatan).toBe('Kecamatan Lamongan (Kota)');
      expect(result.desa).toBeTruthy();
      expect(typeof result.desaId).toBe('number');
    });

    it('returns default fallback when given zeros or NaN', () => {
      const result = findWilayahByCoordinates(0, 0);
      expect(result.kecamatan).toBe('Kecamatan Lamongan (Kota)');
    });
  });

  describe('findCoordinatesByDesa and findCoordinatesByKecamatan', () => {
    it('returns coordinates for known kecamatan', () => {
      const coords = findCoordinatesByKecamatan('Kecamatan Sukorame');
      expect(coords).not.toBeNull();
      expect(coords![0]).toBeCloseTo(-7.3510, 2);
    });

    it('returns coordinates for known desa by name or id', () => {
      const coords = findCoordinatesByDesa('Kelurahan Sukorejo', 'Kecamatan Lamongan (Kota)');
      expect(coords).not.toBeNull();
      expect(Array.isArray(coords)).toBe(true);
      expect(coords![0]).toBeLessThan(0); // Southern hemisphere
    });
  });
});

