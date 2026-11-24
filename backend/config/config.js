import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the config directory
dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/h2s',
  jwtSecret: process.env.JWT_SECRET || 'h2s_dev_fallback_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export default config;
