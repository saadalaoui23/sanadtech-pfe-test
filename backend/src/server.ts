import express, { Express } from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';
import { pool } from './config/db';
import { seedDatabase } from './utils/seeder';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 👇 MODIFICATION DU DÉMARRAGE (ASYNC)
const startServer = async () => {
  try {
    // 1. Tester la connexion à la base de données
    await pool.query('SELECT 1');
    console.log('✅ Base de données connectée (Vérification Server)');

    // 2. Lancer le script de remplissage (Seeder)
    // C'est ici que les 1 million d'utilisateurs vont être créés si la base est vide
    await seedDatabase();

    // 3. Démarrer le serveur Express uniquement si tout est OK
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api/users`);
    });

  } catch (error) {
    console.error('❌ Erreur critique au démarrage :', error);
    process.exit(1); // Arrête le conteneur pour qu'il redémarre proprement
  }
};

// Lancement de la fonction
startServer();

export default app;