import { pool } from '../config/db';
import { from as copyFrom } from 'pg-copy-streams';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// 1. Listes de données réalistes
const FIRST_NAMES = [
  "Saad", "Ahmed", "Karim", "Youssef", "Omar", "Mehdi", "Amine", "Hassan", "Khalid", "Rachid",
  "Sarah", "Fatima", "Khadija", "Zineb", "Noura", "Leila", "Yasmin", "Salma", "Rim", "Meryem",
  "Thomas", "Lucas", "Martin", "Pierre", "Paul", "Jean", "Nicolas", "Julien", "Antoine", "David",
  "Emma", "Alice", "Julie", "Sophie", "Marie", "Laura", "Camille", "Manon", "Chloe", "Lea",
  "John", "Michael", "Robert", "James", "William", "David", "Richard", "Joseph", "Charles", "Daniel"
];

const LAST_NAMES = [
  "Alaoui", "Bennani", "Tazi", "El Amrani", "Berrada", "Idrissi", "Chraibi", "Fassi", "Benjelloun", "Ouazzani",
  "Martin", "Bernard", "Dubois", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon",
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Muller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann",
  "Naciri", "Lyoussi", "Mernissi", "Kabbaj", "Sefrioui", "Benali", "Hassani", "Mansouri", "Bouabid", "Cherkaoui"
];

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const seedDatabase = async () => {
  try {
    // Vérification si la base est pleine
    const { rows } = await pool.query('SELECT COUNT(*) FROM users');
    const count = parseInt(rows[0].count, 10);

    if (count > 0) {
      console.log(`✅ La base contient déjà ${count} utilisateurs. Pas de seed nécessaire.`);
      return;
    }

    console.log("🌱 Base vide. Génération de 1,000,000 d'utilisateurs réalistes...");
    const client = await pool.connect();
    
    try {
      // Préparation du COPY pour aller très vite
      const stream = client.query(copyFrom('COPY users (name, "firstName", "lastName", email) FROM STDIN'));
      
      const dataStream = new Readable({
        read() {
          // 👉 BOUCLE DE 1 MILLION
          for (let i = 0; i < 1000000; i++) {
            const fName = getRandom(FIRST_NAMES);
            const lName = getRandom(LAST_NAMES);
            const fullName = `${fName} ${lName}`;
            
            // 👉 Astuce : on utilise 'i' pour garantir un email unique à 100%
            // Ex: saad.alaoui.1@test.com, saad.alaoui.2@test.com ...
            const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${i}@test.com`;

            // Envoi de la ligne au format PostgreSQL COPY
            this.push(`${fullName}\t${fName}\t${lName}\t${email}\n`);
          }
          this.push(null); // Fin de la génération
        }
      });

      await pipeline(dataStream, stream);
      console.log("✅ Seed terminé ! 1,000,000 utilisateurs insérés.");
      
      console.log("⚡ Optimisation des index...");
      await client.query('CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING gin (name gin_trgm_ops);');
      console.log("✅ Index créés.");

    } finally {
      client.release();
    }

  } catch (error) {
    console.error("❌ Erreur seeding:", error);
  }
};