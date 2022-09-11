const bcrypt = require('bcrypt');
const userRouter = require('express').Router();
const User = require('../models/user');

//api/users

//READ ALL
userRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    url: 1,
    author: 1,
  });
  res.json(users);
});

//CREATE NEW
userRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body;

  if (password.trim().length < 3) {
    return res.status(400).json({ error: 'invalid password' });
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.status(400).json({ error: 'username must be unique' });
  }

  const passwordSaltRounds = 10;
  const passwordHash = await bcrypt.hash(password, passwordSaltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  res.status(201).json(savedUser);
});

module.exports = userRouter;
