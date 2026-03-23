import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import loggerMiddleware from './middlewares/loggerMiddleware.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware); // Custom logger
app.use(morgan('dev'));    // Dev logging

// Routes
app.use('/user', userRoutes);
app.use('/profile', profileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV });
});

// Centralized error handling
app.use(errorMiddleware);

export default app;
