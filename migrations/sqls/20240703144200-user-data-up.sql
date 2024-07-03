/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS "user_data"(
    id SERIAL PRIMARY KEY,
    login VARCHAR(32),
    email VARCHAR(32),
    password_hash VARCHAR(32),
    is_active bool DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
