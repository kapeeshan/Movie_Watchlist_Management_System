function errorHandler(err, req, res, next) {
  const status = Number.isFinite(err.status) ? err.status : 500;

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    error: {
      message: err.message || "Internal Server Error"
    }
  });
}

module.exports = { errorHandler };

