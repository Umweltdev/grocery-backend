// not Found

const notFound = (req, res, next) => {
    const error = new Error(`Not Found : ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  // Error Handler
  
  const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode);
    res.json({
      status: "fail",
      message: err?.message,
      stack: err?.stack,
    });
  };
  
  module.exports = { errorHandler, notFound };
  