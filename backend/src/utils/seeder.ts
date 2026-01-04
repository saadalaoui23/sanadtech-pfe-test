import { pool } from '../config/db';
import { from as copyFrom } from 'pg-copy-streams';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

export const seedDatabase = async () => {
  try {
    // 1. Vérifier si la table est vide
    const { rows } = await pool.query('SELECT COUNT(*) FROM users');
    const count = parseInt(rows[0].count, 10);

    if (count > 0) {
      console.log(`✅ La base contient déjà ${count} utilisateurs. Pas de seed nécessaire.`);
      return;
    }

    console.log("🌱 Base vide détectée. Génération de 1 million d'utilisateurs... (Patientez ~10s)");

    // 2. Connexion pour le streaming
    const client = await pool.connect();
    
    try {
      const stream = client.query(copyFrom('COPY users (name) FROM STDIN'));
      
      // 3. Générateur de données rapide (Stream)
      const dataStream = new Readable({
        read() {
          // On génère 1 million d'utilisateurs
          // Format CSV pour COPY: "Nom\n"
          for (let i = 0; i < 1000000; i++) {
             // Génère des noms aléatoires : "User a1b2", "User c3d4"...
             const randomSuffix = Math.random().toString(36).substring(7); 
             this.push(`User ${randomSuffix}\n`);
          }
          this.push(null); // Fin du stream
        }
      });

      // 4. Exécution du pipeline
      await pipeline(dataStream, stream);
      console.log("✅ Seed terminé ! 1,000,000 utilisateurs insérés.");
      
      // 5. Création/Rafraichissement des index
      console.log("⚡ Optimisation des index...");
      await client.query('CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING gin (name gin_trgm_ops);');
      console.log("✅ Index créés.");

    } finally {
      client.release();
    }

  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
  }
};