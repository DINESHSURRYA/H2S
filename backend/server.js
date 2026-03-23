import app from './app.js';
import config from './config/config.js';

const startServer = () => {
  app.listen(config.PORT, () => {
    console.log(`🚀 Server running in ${config.NODE_ENV} mode on http://localhost:${config.PORT}`);
    console.log(`🔗 API Points:`);
    console.log(`   - http://localhost:${config.PORT}/user`);
    console.log(`   - http://localhost:${config.PORT}/profile`);
  });
};

startServer();
