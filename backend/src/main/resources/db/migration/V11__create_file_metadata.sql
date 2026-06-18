CREATE TABLE IF NOT EXISTS file_metadata (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename VARCHAR(500) NOT NULL,
    content_type     VARCHAR(200),
    stored_filename  VARCHAR(500) NOT NULL,
    size             BIGINT       NOT NULL,
    uploaded_by      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_file_metadata_uploaded_by ON file_metadata(uploaded_by);
