import { Pool } from 'pg';

// Configuration de la connexion (Pool = Gestionnaire de connexions multiples)
export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sanad_pfe',
  password: 'sasmasmasrh10', // Votre mot de passe
  port: 5432,
  max: 20, // Nombre max de connexions simultanées
  idleTimeoutMillis: 30000,
});

// Test de connexion au démarrage
pool.on('connect', () => {
  console.log('Base de données connectée avec succès');
});

pool.on('error', (err) => {
  console.error('Erreur inattendue sur le client idle', err);
  process.exit(-1);
});