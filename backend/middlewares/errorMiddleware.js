import { error } from '../utils/response.js';

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.url} - ${message}`);
  
  return error(res, message, statusCode);
};

export default errorMiddleware;
