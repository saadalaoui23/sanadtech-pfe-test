import express, { Express } from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Rate limiting to protect API
//const limiter = rateLimit({
  //windowMs: 1 * 60 * 1000, // 1 minute
  //max: 1000, // Limit each IP to 100 requests per windowMs
  //message: 'Too many requests from this IP, please try again later.',
//});

// Middleware
app.use(compression()); // Enable gzip compression
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use('/api/', limiter); // Apply rate limiting to API routes

// Routes
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/users`);
});

export default app;
