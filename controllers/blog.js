const jwt = require('jsonwebtoken');
const blogRouter = require('express').Router();

const Blog = require('../models/blog');
const User = require('../models/user');

//api/blogs

//READ ALL
blogRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 });

  res.json(blogs);
});

//CREATE NEW
blogRouter.post('/', async (req, res) => {
  const body = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  const user = await User.findById(userId);

  const blog = new Blog({ ...body, user: user._id });

  const savedBlog = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  res.status(201).json(savedBlog);
});

//DELETE BY ID
blogRouter.delete('/:id', async (req, res) => {
  const { id: blogId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  const blog = await Blog.findById(blogId);

  if (blog.user?.toString() !== userId) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  await Blog.findByIdAndRemove(blogId);

  res.status(204).end();
});

//UPDATE BY ID
blogRouter.put('/:id', async (req, res) => {
  const { id: blogId } = req.params;
  const body = req.body;

  const updatedBlog = await Blog.findByIdAndUpdate(blogId, body, { new: true });

  res.json(updatedBlog);
});

module.exports = blogRouter;
