-- Entry Code Types
CREATE TABLE entry_code_types (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  name TEXT NOT NULL,
                                  description TEXT,
                                  max_uses INT NULL  -- NULL = unlimited, 1 = single use, etc.
);

-- Users
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       username VARCHAR(20) NOT NULL UNIQUE,
                       email TEXT NOT NULL UNIQUE,
                       password_hash TEXT NOT NULL,
                       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                       refresh_token TEXT NULL,
                       refresh_token_expires_at TIMESTAMP NULL
);

-- Entry Codes
CREATE TABLE entry_codes (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             code VARCHAR(8) NOT NULL UNIQUE,
                             code_owner_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
                             type_id UUID NOT NULL REFERENCES entry_code_types(id),
                             expiry TIMESTAMP NOT NULL,
                             use_count INT NOT NULL DEFAULT 0
);

-- Logs
CREATE TABLE logs (
                      id BIGSERIAL PRIMARY KEY,
                      event_type TEXT NOT NULL,  -- ACCESS, DOOR, CODE, SYSTEM
                      event TEXT NOT NULL,       -- GRANTED, DENIED, OPENED, LOCKED, CREATED, EXPIRED, DEVICE_ONLINE, etc.
                      event_time TIMESTAMP NOT NULL DEFAULT NOW(),
                      user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
                      entry_code_id UUID NULL REFERENCES entry_codes(id) ON DELETE SET NULL
);