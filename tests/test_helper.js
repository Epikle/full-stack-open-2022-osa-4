const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
  {
    title: 'Test title 1',
    author: 'Author 1',
    url: 'Test URL 1',
    likes: 0,
  },
  {
    title: 'Test title 2',
    author: 'Author 2',
    url: 'Test URL 2',
    likes: 10,
  },
];

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb,
};
