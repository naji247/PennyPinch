module.exports = app => {
  app.use(function(err, req, res, next) {
    if (!err) {
      res.status(500).send("Internal Server Error.");
    }
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode).json({ error: err.message });
  });
};
