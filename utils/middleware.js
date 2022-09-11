const jwt = require('jsonwebtoken');

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'invalid token',
    });
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token expired',
    });
  }

  next(error);
};

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'unknown endpoint' });
};

const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    req.token = auth.substring(7);
  }

  next();
};

const userExtractor = (req, res, next) => {
  if (req.token) {
    const token = req.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
  }

  next();
};

module.exports = {
  errorHandler,
  unknownEndpoint,
  tokenExtractor,
  userExtractor,
};
