const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const helper = require('./test_helper');
const User = require('../models/user');

const api = supertest(app);

const Blog = require('../models/blog');
const { response } = require('express');

let token = null;

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const blogObjects = helper.initialBlogs
    .map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);

  const passwordHash = await bcrypt.hash('salainen', 10);
  const user = new User({
    username: 'testaaja',
    passwordHash,
  });

  await user.save();

  await api
    .post('/api/login')
    .send({ username: 'testaaja', password: 'salainen' })
    .expect(200)
    .then((response) => (token = response.body.token));
});

describe('when there are blogs', () => {
  test('all blogs are returned', async () => {
    const allBlogs = await api.get('/api/blogs');

    expect(allBlogs.body).toHaveLength(helper.initialBlogs.length);
  });

  test('unique identifier property of the blog posts is named id', async () => {
    const allBlogs = await api.get('/api/blogs');

    expect(allBlogs.body[0].id).toBeDefined();
  });
});

describe('when there is a logged in user', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    const title = blogsAtEnd.map((n) => n.title);
    expect(title).toContain(
      'Type wars',
    );
  });
});

test('if blog is added but likes property is missing, likes will default to the value 0', async () => {
  const newBlog = {
    title: 'React native',
    author: 'Uncle bob',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/React-native.html',
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const lastAddedBlog = blogsAtEnd.find((n) => n.title === 'React native');
  expect(lastAddedBlog.likes).toBe(0);
});

describe('when user is not logged in', () => {
  test('adding a blog fails with the proper status code 401 ', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
