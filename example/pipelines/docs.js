const matter = require('../../lib/plugins/matter');
const markdown = require('../../lib/plugins/markdown');

module.exports = [
  matter(),
  markdown(),
  async (file) => {
    const {categories} = file.matched.params;
    const category = categories.join(':');
    const meta = file.meta();

    file.matter.category = category;
    meta.categories = meta.categories || {};
    meta.categories[category] = meta.categories[category] || [];
    meta.categories[category].push(file);

    return file;
  },
  async file => {
    file.view = {
      name: 'doc',
      data() {
        return {
          title: file.matter.title,
          doc: {
            title: file.matter.title,
            category: file.matched.params.categories.join(':'),
            contributors: file.matter.contributors || [],
            contents: file.contents,
          }
        }
      }
    };

    return file;
  }
];
