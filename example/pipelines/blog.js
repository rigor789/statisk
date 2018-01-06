const matter = require('../../lib/plugins/matter');
const markdown = require('../../lib/plugins/markdown');


module.exports = [
  matter(),
  markdown(),
  async (file) => {
    const meta = file.meta();
    meta.posts = meta.posts || [];
    meta.posts.push(file);
    return file;
  },
  async file => {
    file.view = {
      name: 'post',
      data() {
        const {year, month, day} = file.matched.params;
        return {
          title: file.matter.title,
          post: {
            title: file.matter.title,
            date: `${year}-${month}-${day}`,
            contents: file.contents
          }
        }
      }
    };

    return file;
  }
];
