import { Pool } from 'pg';

export const pool = new Pool({
  // On utilise process.env.DB_USER s'il existe (Docker), sinon 'postgres' (Local)
  user: process.env.DB_USER || 'postgres',
  
  // C'EST ICI LE PLUS IMPORTANT :
  // Docker enverra 'db' (le nom du service), ton PC utilisera 'localhost'
  host: process.env.DB_HOST || 'localhost', 
  
  database: process.env.DB_NAME || 'sanad_pfe',
  password: process.env.DB_PASSWORD || 'admin',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log('✅ Base de données connectée');
});

pool.on('error', (err) => {
  console.error('❌ Erreur critique DB:', err);
  process.exit(-1);
});