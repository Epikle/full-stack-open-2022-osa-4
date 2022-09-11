require('dotenv').config();

const PORT = process.env.PORT || 3003;
const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? 'mongodb://localhost:27017/bloglist'
    : process.env.MONGODB_URI;

module.exports = {
  MONGODB_URI,
  PORT,
};
