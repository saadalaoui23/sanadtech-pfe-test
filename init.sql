-- 1. Activer l'extension Trigramme
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Créer la table users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- 3. Créer les indexes
CREATE INDEX IF NOT EXISTS idx_users_name_btree ON users (name);
CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING gin (name gin_trgm_ops);