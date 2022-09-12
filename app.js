const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('express-async-errors');

const config = require('./utils/config');
const middleware = require('./utils/middleware');
const blogRoutes = require('./controllers/blog');
const userRoutes = require('./controllers/user');
const loginRouter = require('./controllers/login');

const app = express();

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('db connected...');
  })
  .catch((error) => {
    console.log('error connecting to db: ', error.message);
  });

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

app.use(middleware.tokenExtractor);
app.use(middleware.userExtractor);

app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/login', loginRouter);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
