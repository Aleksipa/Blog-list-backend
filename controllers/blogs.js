const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs.map((blog) => blog.toJSON()));
});

blogsRouter.post('/', async (request, response, next) => {
  try {
    const { body } = request;

    const decodedToken = jwt.verify(request.token, process.env.SECRET);

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }
    const { user } = request;

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id,
    });

    const savedBlog = await blog.save();
    response.status(201).json(savedBlog.toJSON());
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
  } catch (exeption) {
    next(exeption);
  }
});

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);

    if (!decodedToken.id || !request.token) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }

    const { user } = request;
    const blog = await Blog.findById(request.params.id);

    if (blog.user.toString() === user.id.toString()) {
      try {
        await Blog.findByIdAndRemove(request.params.id);
        response.status(204).end();
      } catch (exception) {
        next(exception);
      }
    } else {
      response.status(401).json({ error: 'Only the owner is authorized to delete this blog' });
    }
  } catch (exeption) {
    next(exeption);
  }
});

blogsRouter.put('/:id', (request, response, next) => {
  const { body } = request;

  const blog = {
    likes: body.likes,
  };

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then((updatedBlog) => {
      response.json(updatedBlog.toJSON());
    })
    .catch((error) => next(error));
});

module.exports = blogsRouter;
