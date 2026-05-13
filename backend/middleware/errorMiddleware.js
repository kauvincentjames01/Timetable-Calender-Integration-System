export const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]', err.stack);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
};
