/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS connection (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   is_active bool DEFAULT true NOT NULL
);
