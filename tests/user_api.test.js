const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');

const app = require('../app');
const helper = require('./test_helper');
const User = require('../models/user');

const api = supertest(app);

describe('initialize userdb with one user and then do something', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('salasana', 10);
    const user = new User({
      username: 'test',
      name: 'test name',
      passwordHash,
    });

    await user.save();
  });

  test('create user with new username', async () => {
    const usersBefore = await helper.usersInDb();

    const newUser = {
      username: 'test2',
      name: 'test name 2',
      password: 'salasana2',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await helper.usersInDb();
    expect(usersAfter).toHaveLength(usersBefore.length + 1);

    const usernames = usersAfter.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('create user with existing username, should fail with 400 code', async () => {
    const usersBefore = await helper.usersInDb();

    const newUser = {
      username: 'test',
      name: 'test name 2',
      password: 'salasana',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('username must be unique');

    const usersAfter = await helper.usersInDb();
    expect(usersAfter).toHaveLength(usersBefore.length);
  });

  test('create user with empty username, should fail with 400 code', async () => {
    const usersBefore = await helper.usersInDb();

    const newUser = {
      username: '',
      name: 'test name 2',
      password: 'salasana',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('Path `username` is required');

    const usersAfter = await helper.usersInDb();
    expect(usersAfter).toHaveLength(usersBefore.length);
  });

  test('create user with empty password, should fail with 400 code', async () => {
    const usersBefore = await helper.usersInDb();

    const newUser = {
      username: 'abc',
      name: 'test name 2',
      password: '',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('invalid password');

    const usersAfter = await helper.usersInDb();
    expect(usersAfter).toHaveLength(usersBefore.length);
  });

  test('create user with username < 3, should fail with 400 code', async () => {
    const usersBefore = await helper.usersInDb();

    const newUser = {
      username: 'ab',
      name: 'test name 2',
      password: 'salasana',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain(
      'shorter than the minimum allowed length (3)'
    );

    const usersAfter = await helper.usersInDb();
    expect(usersAfter).toHaveLength(usersBefore.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
