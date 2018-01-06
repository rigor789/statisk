const Generator = require('./lib/generator');
const matter = require('./lib/plugins/matter');
const markdown = require('./lib/plugins/markdown');
const templates = require('./lib/plugins/templates');

const routes = {
  'blog/:year/:month/:day/:slug/': {
    from: 'content/blog/:year-:month-:day-:slug.md',
    pipeline: [
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
              contents: file.contents
            }
          };
        }
      })
    ]
  },
  ':lang/docs/:path+/': {
    from: 'content/docs/:lang/:path+.md',
    pipeline: [
      matter(),
      markdown(),
    ]
  },
  ':lang?/': {
    from: 'content/:lang?/index.html',
  }
};

new Generator({
  cwd: __dirname,
  source: './content',
  destination: './dist',
  clean: true,
  // verbose: true,
  // debug: true,
  routes,
})
  .run();
