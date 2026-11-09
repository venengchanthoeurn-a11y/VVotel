-- ==============================================================================
-- VVOTEL HOTEL MANAGEMENT & BOOKING PLATFORM
-- ENTERPRISE POSTGRESQL SCHEMA MIGRATION v1.0
-- Standard: ACID Transactions, Row-Level Locking, Non-Negative Constraints
-- ==============================================================================

-- 1. ROOM TYPES MASTER CATALOG
CREATE TABLE IF NOT EXISTS room_types (
    id VARCHAR(64) PRIMARY KEY,
    name_km VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    base_price_cents BIGINT NOT NULL CHECK (base_price_cents > 0),
    total_physical_count INT NOT NULL CHECK (total_physical_count > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DAILY ROOM INVENTORY LEDGER (With Non-Negative Constraints)
CREATE TABLE IF NOT EXISTS room_inventory (
    id BIGSERIAL PRIMARY KEY,
    room_type_id VARCHAR(64) NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    stay_date DATE NOT NULL,
    total_capacity INT NOT NULL CHECK (total_capacity > 0),
    allocated_count INT NOT NULL DEFAULT 0,
    CONSTRAINT chk_inventory_bounds CHECK (allocated_count <= total_capacity AND allocated_count >= 0),
    CONSTRAINT uq_room_date UNIQUE (room_type_id, stay_date)
);

CREATE INDEX IF NOT EXISTS idx_inventory_lookup ON room_inventory(room_type_id, stay_date);

-- 3. GUESTS & CONTACT DIRECTORY
CREATE TABLE IF NOT EXISTS guests (
    id VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(120),
    last_name VARCHAR(120),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    country VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_lookup ON guests(email, phone);

-- 4. BOOKINGS PRIMARY TRANSACTIONAL TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_reference VARCHAR(64) NOT NULL UNIQUE,
    booking_category VARCHAR(32) NOT NULL DEFAULT 'ROOM',
    guest_id VARCHAR(64) REFERENCES guests(id) ON DELETE SET NULL,
    guest_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    room_type_id VARCHAR(64) NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    room_count INT NOT NULL DEFAULT 1 CHECK (room_count > 0),
    room_number VARCHAR(64),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL CHECK (nights > 0),
    adults INT NOT NULL CHECK (adults > 0),
    children INT NOT NULL DEFAULT 0 CHECK (children >= 0),
    include_breakfast BOOLEAN NOT NULL DEFAULT FALSE,
    base_rate_cents BIGINT NOT NULL CHECK (base_rate_cents > 0),
    breakfast_cents BIGINT NOT NULL DEFAULT 0 CHECK (breakfast_cents >= 0),
    discount_cents BIGINT NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
    total_amount_cents BIGINT NOT NULL CHECK (total_amount_cents >= 0),
    total_amount_usd NUMERIC(10, 2) NOT NULL,
    total_amount_khr BIGINT NOT NULL,
    stay_status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED',
    payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(64) NOT NULL,
    transaction_id VARCHAR(120) NOT NULL,
    signature_hmac VARCHAR(128) NOT NULL,
    price_snapshot JSONB NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actual_check_in_at TIMESTAMPTZ,
    actual_check_out_at TIMESTAMPTZ,
    CONSTRAINT chk_stay_dates CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(stay_status, payment_status);

-- 5. PAYMENT TRANSACTIONS & REPLAY DEFENSE LEDGER
CREATE TABLE IF NOT EXISTS payment_transactions (
    id VARCHAR(120) PRIMARY KEY,
    booking_id VARCHAR(64) NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    provider VARCHAR(64) NOT NULL, -- 'BAKONG_KHQR' | 'ABA_PAYWAY' | 'CARD_PREAUTH_HOLD' | 'PAY_AT_HOTEL'
    transaction_hash VARCHAR(255) NOT NULL UNIQUE,
    amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
    provider_response_code VARCHAR(32),
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_txn_hash ON payment_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_txn_booking ON payment_transactions(booking_id);

-- 6. CRYPTOGRAPHIC AUDIT LOG LEDGER
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(120) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(64) NOT NULL,
    actor_ip VARCHAR(64) NOT NULL,
    actor_username VARCHAR(120),
    actor_role VARCHAR(64),
    actor_user_agent TEXT,
    status VARCHAR(32) NOT NULL,
    resource VARCHAR(120),
    details JSONB NOT NULL,
    previous_hash CHAR(64) NOT NULL,
    integrity_hash CHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp DESC);

-- 7. SEED INITIAL ROOM TYPES CATALOG
INSERT INTO room_types (id, name_km, name_en, base_price_cents, total_physical_count)
VALUES
    ('superior-river', 'បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេមេគង្គ', 'Superior Room River View', 12500, 10),
    ('deluxe-terrace', 'បន្ទប់ឌីឡាក់ ទេសភាពសួនច្បារ និងទន្លេ', 'Deluxe Terrace Garden & River View', 16500, 8),
    ('colonial-suite', 'បន្ទប់ស្វីត បែបអាណានិគមបារាំង', 'French Colonial Heritage Suite', 24000, 5),
    ('presidential-suite', 'បន្ទប់ប្រធានាធិបតី វឌ្ឍនៈ', 'Vattanac Presidential Suite', 38000, 2)
ON CONFLICT (id) DO UPDATE SET
    name_km = EXCLUDED.name_km,
    name_en = EXCLUDED.name_en,
    base_price_cents = EXCLUDED.base_price_cents,
    total_physical_count = EXCLUDED.total_physical_count;
