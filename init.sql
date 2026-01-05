-- Active l'extension pour la recherche rapide (trigrammes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- On supprime l'ancienne table si elle existe pour éviter les conflits
DROP TABLE IF EXISTS users;

-- On crée la table avec TOUTES les colonnes nécessaires
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    "firstName" VARCHAR(100),  -- Avec guillemets pour respecter la casse
    "lastName" VARCHAR(100),   -- Avec guillemets pour respecter la casse
    email VARCHAR(255) UNIQUE
);

-- On crée les index pour la performance
CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);