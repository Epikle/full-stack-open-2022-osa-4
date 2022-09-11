const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((prevVal, curVal) => prevVal + curVal.likes, 0);
};

const favoriteBlog = (blogs) => {
  return blogs.sort((a, b) => b.likes - a.likes)[0];
};

const mostBlogs = (blogs) => {
  let author = '';
  let blogCount = 0;
  blogs.forEach((blog) => {
    const authorBlogCount = blogs.filter(
      (filterBlog) => blog.author === filterBlog.author
    ).length;

    if (authorBlogCount > blogCount) {
      blogCount = authorBlogCount;
      author = blog.author;
    }
  });

  return { author, blogs: blogCount };
};

const mostLikes = (blogs) => {
  let author = '';
  let totalLikes = 0;
  for (let blog of blogs) {
    if (author === blog.author) continue;
    const likes = blogs
      .filter((b) => b.author === blog.author)
      .reduce((prev, curr) => prev + curr.likes, 0);

    if (likes > totalLikes) {
      totalLikes = likes;
      author = blog.author;
    }
  }
  return { author, likes: totalLikes };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
