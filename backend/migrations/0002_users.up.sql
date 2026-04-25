CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_sub    TEXT UNIQUE NOT NULL,
    email         CITEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    picture_url   TEXT,
    access_status TEXT NOT NULL DEFAULT 'pending'
                  CHECK (access_status IN ('pending','approved','revoked')),
    approved_by   UUID REFERENCES users(id),
    approved_at   TIMESTAMPTZ,
    revoked_by    UUID REFERENCES users(id),
    revoked_at    TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_access_status ON users(access_status);
