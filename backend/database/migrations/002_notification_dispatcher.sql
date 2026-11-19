-- Migration 002: Notification Dispatcher & Early Warning Logs
-- CivicTrack Lamongan

ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
ALTER TABLE users ADD COLUMN IF NOT EXISTS wilayah_id BIGINT REFERENCES wilayah_administratif(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS desa_id BIGINT REFERENCES wilayah_administratif(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token VARCHAR(255);

ALTER TABLE subscription_notifikasi ALTER COLUMN proyek_id DROP NOT NULL;
ALTER TABLE subscription_notifikasi ADD COLUMN IF NOT EXISTS wilayah_id BIGINT REFERENCES wilayah_administratif(id) ON DELETE CASCADE;
ALTER TABLE subscription_notifikasi ADD COLUMN IF NOT EXISTS desa_id BIGINT REFERENCES wilayah_administratif(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS notification_logs (
    id BIGSERIAL PRIMARY KEY,
    proyek_id BIGINT REFERENCES proyek(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    trigger_type VARCHAR(50) NOT NULL,
    channel VARCHAR(30) NOT NULL DEFAULT 'all',
    judul VARCHAR(200) NOT NULL,
    pesan TEXT NOT NULL,
    target_type VARCHAR(50) NOT NULL DEFAULT 'radius',
    radius_meter INTEGER,
    distance_meters DOUBLE PRECISION,
    is_delivered BOOLEAN NOT NULL DEFAULT TRUE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_logs_proyek ON notification_logs(proyek_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_user ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_trigger ON notification_logs(trigger_type);
CREATE INDEX IF NOT EXISTS idx_notif_logs_created ON notification_logs(created_at);
