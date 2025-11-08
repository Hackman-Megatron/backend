import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import articlesRoutes from './routes/articles.routes.js';
import mouvementsRoutes from './routes/mouvements.routes.js';
import commandesRoutes from './routes/commandes.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import usersRoutes from './routes/users.routes.js';
import rapportsRoutes from './routes/rapports.routes.js';
import pdfRoutes from './routes/pdf.routes.js';
import historiqueRoutes from './routes/historique.routes.js';
import fournisseursRoutes from './routes/fournisseurs.routes.js';
import clientsRoutes from './routes/clients.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'Stock Management API',
    version: '1.0.0',
    status: 'running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/mouvements', mouvementsRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/historique', historiqueRoutes);
app.use('/api/fournisseurs', fournisseursRoutes);
app.use('/api/clients', clientsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use(errorHandler);

const startServer = async () => {
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('Failed to connect to database. Server will not start.');
    console.error('Please check your .env file and ensure MySQL is running.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ API available at: http://localhost:${PORT}/api`);
    console.log('\nAvailable routes:');
    console.log('  POST   /api/auth/login');
    console.log('  POST   /api/auth/register');
    console.log('  GET    /api/dashboard/stats');
    console.log('  GET    /api/dashboard/charts/:type');
    console.log('  GET    /api/articles');
    console.log('  GET    /api/mouvements');
    console.log('  GET    /api/commandes');
    console.log('  GET    /api/categories');
    console.log('  GET    /api/users');
    console.log('  GET    /api/rapports/productions');
    console.log('  GET    /api/rapports/livraisons\n');
  });
};

startServer();

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
