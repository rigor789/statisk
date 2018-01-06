const matter = require('../../lib/plugins/matter');
const markdown = require('../../lib/plugins/markdown');
const templates = require('../../lib/plugins/templates');

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
  templates({
    path: './templates',
    template: 'doc.ejs',
    data(file) {
      return {
        doc: {
          title: file.matter.title,
          contents: file.contents,
          category: file.matter.category,
          contributors: (file.matter.contributors || []).map(name => ({
            name: name,
            image: `https://github.com/${name}.png`
          }))
        }
      };
    }
  })
];
