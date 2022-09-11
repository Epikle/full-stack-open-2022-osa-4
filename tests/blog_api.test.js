const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../app');
const helper = require('./test_helper');
const Blog = require('../models/blog');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

describe('get blogs', () => {
  test('bloglist length is 2', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(2);
  });

  test('is there id field', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0].id).toBeDefined();
  });

  test('is there not _id field', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0]._id).not.toBeDefined();
  });
});

describe('post blogs', () => {
  let userData = {};

  beforeEach(async () => {
    const loginData = {
      username: 'test',
      password: 'salasana',
    };

    userData = await api.post('/api/login').send(loginData);
  });

  test('add a valid blog item', async () => {
    const newBlog = {
      title: 'Test title 3',
      author: 'Author 3',
      url: 'Test URL 3',
      likes: 20,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${userData.body.token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');

    const contents = response.body.map((r) => r.title);

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
    expect(contents).toContain(newBlog.title);
  });

  test('new blog item without likes field, should set likes to 0', async () => {
    const newBlog = {
      title: 'Test title 4',
      author: 'Author 4',
      url: 'Test URL 4',
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${userData.body.token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');

    const addedItemIndex = response.body.length - 1;

    expect(response.body[addedItemIndex].likes).toBe(0);
  });

  test('empty title and url should return 400 code', async () => {
    const newBlog = {
      title: '',
      author: 'Author 5',
      url: '',
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${userData.body.token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('without bearer token sent blog should return 401 error code', async () => {
    const newBlog = {
      title: 'Test',
      author: 'Author 5',
      url: 'test',
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });
});

describe('delete blogs', () => {
  let userData = {};

  beforeEach(async () => {
    const loginData = {
      username: 'test',
      password: 'salasana',
    };

    userData = await api.post('/api/login').send(loginData);
  });

  test('valid id, should success with 204 code', async () => {
    const newBlog = {
      title: 'Test',
      author: 'Author 5',
      url: 'test',
    };

    const blogData = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${userData.body.token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    await api
      .delete(`/api/blogs/${blogData.body.id}`)
      .set('Authorization', `Bearer ${userData.body.token}`)
      .expect(204);

    const blogsAfter = await helper.blogsInDb();
    const blogIdsAfter = blogsAfter.map((b) => b.id);

    expect(blogIdsAfter).not.toContain(blogData.body.id);
  });

  test('invalid id, should fail with code 400 bad request', async () => {
    const badId = 'abc123';

    await api
      .delete(`/api/blogs/${badId}`)
      .set('Authorization', `Bearer ${userData.body.token}`)
      .expect(400);
  });
});

describe('update blogs', () => {
  test('valid id, should update blog and show updated likes 0 => 25', async () => {
    const blogsBefore = await helper.blogsInDb();

    const newBlogData = {
      ...blogsBefore[0],
      likes: 25,
    };

    await api
      .put(`/api/blogs/${blogsBefore[0].id}`)
      .send(newBlogData)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAfter = await helper.blogsInDb();
    const updatedBlogAfter = blogsAfter.filter(
      (b) => b.id === blogsBefore[0].id
    );

    expect(updatedBlogAfter[0].likes).toBe(25);
  });

  test('invalid id, should fail to update with 400 code', async () => {
    const newBlogData = {
      ...helper.initialBlogs[0],
      id: 'abc123',
    };

    await api
      .put(`/api/blogs/${newBlogData.id}`)
      .send(newBlogData)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
