const Generator = require('./lib/generator');
const matter = require('./lib/plugins/matter');
const markdown = require('./lib/plugins/markdown');
const templates = require('./lib/plugins/templates');

const authors = {
  'rigor789': {
    name: 'Igor Randjelovic',
    url: 'https://igor-randjelovic.com',
  }
};

const routes = {
  'assets/:path': {
    from: 'assets/:path'
  },
  'blog/:year/:month/:day/:slug/index.html': {
    from: 'content/blog/:year-:month-:day-:slug.md',
    pipeline: [
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
    ]
  },
  ':lang/docs/:categories+/:slug/index.html': {
    from: 'content/docs/:lang/:categories+/:slug.md',
    pipeline: [
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

    ]
  },
  ':lang?/index.html': {
    from: 'content/:lang?/index.html',
  }
};

new Generator({
  cwd: __dirname,
  sources: ['./content', './assets'],
  destination: './dist',
  clean: true,
  // verbose: true,
  // debug: true,
  routes,
})
  .use((files) => {
    return files;
  })
  .run();
