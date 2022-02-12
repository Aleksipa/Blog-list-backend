const Blog = require('../models/blog');

const dummy = (blogs) => 1;

const totalLikes = (blogs) => blogs.reduce((sum, b) => sum + b.likes, 0);

const favoriteBlog = (blogs) => blogs.reduce(
  (largest, b) => (largest.likes > b.likes ? largest : b),
  [],
);

const mostBlogs = (blogs) => {
  const blogsPerAuthor = blogs.reduce((numBlogs, { author }) => {
    numBlogs[author] = numBlogs[author] || 0;
    numBlogs[author] += 1;
    return numBlogs;
  }, {});

  if (Object.keys(blogsPerAuthor).length !== 0) {
    const mostBlogsPerAuthor = Object.keys(blogsPerAuthor)
      .reduce((a, b) => (blogsPerAuthor[a] > blogsPerAuthor[b] ? a : b));
    return { author: mostBlogsPerAuthor, blogs: blogsPerAuthor[mostBlogsPerAuthor] };
  }
};

const mostLikes = (blogs) => {
  const likesPerAuthor = blogs.reduce((numBlogs, { author, likes }) => {
    numBlogs[author] = numBlogs[author] || 0;
    numBlogs[author] += likes;
    return numBlogs;
  }, {});

  if (Object.keys(likesPerAuthor).length !== 0) {
    const mostBlogsPerAuthor = Object.keys(likesPerAuthor)
      .reduce((a, b) => (likesPerAuthor[a] > likesPerAuthor[b] ? a : b));
    return { author: mostBlogsPerAuthor, likes: likesPerAuthor[mostBlogsPerAuthor] };
  }
};

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes,
};
