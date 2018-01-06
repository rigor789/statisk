const matter = require('../../lib/plugins/matter');
const markdown = require('../../lib/plugins/markdown');
const templates = require('../../lib/plugins/templates');

const authors = {
  'rigor789': {
    name: 'Igor Randjelovic',
    url: 'https://igor-randjelovic.com',
  }
};


module.exports = [
  async (file) => {
    const meta = file.meta();
    meta.posts = meta.posts || [];
    meta.posts.push(file);
    return file;
  },
  matter(),
  markdown(),
  templates({
    path: './templates',
    template: 'post.ejs',
    data(file) {
      const {year, month, day} = file.matched.params;

      return {
        post: {
          date: `${year}-${month}-${day}`,
          title: file.matter.title,
          contents: file.contents,
          authors: (file.matter.authors || []).map(username => {
            return authors[username] || {
              name: username,
              url: `https://github.com/${username}`
            }
          })
        }
      };
    }
  })
];
