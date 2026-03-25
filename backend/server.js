import app from './app.js';
import config from './config/config.js';
import connectDB from './config/db.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  app.listen(config.port, () => {
    console.log(`🚀 Server running in ${config.nodeEnv} mode on http://localhost:${config.port}`);
    console.log(`🔗 Health check: http://localhost:${config.port}/health`);
  });
};

startServer();
