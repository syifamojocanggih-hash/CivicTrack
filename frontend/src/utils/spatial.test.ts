import { describe, it, expect } from 'vitest';
import { isPointInPolygon, validateCoordinatesInKecamatan } from './spatial';

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
});
