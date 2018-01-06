const Generator = require('./lib/generator');

const m = require('gray-matter');
const matter = async file => {
  const parsed = m(file.contents);
  file.matter = parsed.data;
  file.contents = parsed.content;

  return file;
};
const markdown = require('./lib/plugins/markdown');

const routes = {
  'blog/:year/:month/:day/:slug/': {
    from: 'content/blog/:year-:month-:day-:slug.md',
    pipeline: [
      matter,
      markdown
    ]
  },
  ':lang/docs/:path+/': {
    from: 'content/docs/:lang/:path+.md',
    pipeline: [
      matter,
      markdown,
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
