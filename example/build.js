const Generator = require('../lib/generator');

const routes = {
  'assets/:path': {
    from: 'assets/:path'
  },
  'blog/:year/:month/:day/:slug/index.html': {
    from: 'content/blog/:year-:month-:day-:slug.md',
    pipeline: require('./pipelines/blog')
  },
  ':lang/docs/:categories+/:slug/index.html': {
    from: 'content/docs/:lang/:categories+/:slug.md',
    pipeline: require('./pipelines/docs')
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
  routes,
}).run();
