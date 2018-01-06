const grayMatter = require('gray-matter');

module.exports = function matter(opts) {
  const options = Object.assign({}, opts);

  return async (file) => {
    const parsed = grayMatter(file.contents, options);
    file.matter = parsed.data;
    file.contents = parsed.content;

    return file;
  }
};
