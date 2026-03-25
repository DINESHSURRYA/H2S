import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async () => {
  try {
    if (!config.mongoUri) {
      console.warn('MongoDB URI is missing. Skipping database connection for now.');
      return;
    }
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
