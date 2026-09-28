-- TAMP Marketplace — user country attribution and admin reporting
ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code CHAR(2) REFERENCES countries(code) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country_code);
