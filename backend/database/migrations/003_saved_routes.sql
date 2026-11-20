-- Migration 003: Saved Routes & Polyline Overlap Integration
-- CivicTrack Lamongan

CREATE TABLE IF NOT EXISTS saved_routes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama_rute VARCHAR(200) NOT NULL,
    koordinat_asal JSONB,
    koordinat_tujuan JSONB,
    polyline_data JSONB NOT NULL,
    moda_transportasi VARCHAR(20) NOT NULL DEFAULT 'mobil',
    jarak_km NUMERIC(6, 2),
    estimasi_menit INTEGER,
    catatan VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_routes_user ON saved_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_routes_created ON saved_routes(created_at);
