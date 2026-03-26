import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorMiddleware from './middlewares/errorMiddleware.js';
import loggerMiddleware from './middlewares/loggerMiddleware.js';
import ngoRoutes from './routes/ngoRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import helpRequestRoutes from './routes/helpRequestRoutes.js';
import grantedHelpRoutes from './routes/grantedHelpRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware); // Custom logger
app.use(morgan('dev'));    // Dev logging

// Logger middleware for debugging
app.use((req, res, next) => {
  console.log(`[Express] ${req.method} ${req.url}`);
  next();
});

// Diagnostic Route (Testing)

// Routes
app.use('/help-request', helpRequestRoutes);
app.use('/grant-help', grantedHelpRoutes);
app.use('/ngo', ngoRoutes);

app.use('/admin/api', adminRoutes);
app.use('/volunteer', volunteerRoutes);

// Serve Admin Panel (Static HTML)
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV });
});

// Centralized error handling
app.use(errorMiddleware);

export default app;
