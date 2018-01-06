const Generator = require('../lib/generator');
const views = require('../lib/plugins/views');

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
    pipeline: require('./pipelines/blog')
  },
  ':lang/docs/:categories+/:slug/index.html': {
    from: 'content/docs/:lang/:categories+/:slug.md',
    pipeline: require('./pipelines/docs'),
  },
  ':lang?/index.html': {
    from: 'content/:lang?/index.html',
    pipeline: [
      async file => {
        file.view = {
          name: 'landing',
          data() {
            return {
              page: {
                title: 'NativeScript-Vue',
                contents: file.contents
              }
            }
          }
        };
        return file;
      }
    ]
  }
};

new Generator({
  cwd: __dirname,
  sources: ['./content', './assets'],
  destination: './dist',
  clean: true,
  routes,
  // verbose: true,
  meta: {
    title: 'NativeScript-Vue'
  }
})
  .use(views({
    view(file) {
      return file.view && file.view.name;
    },
    data(file) {
      try {
        return file.view.data();
      } catch (ex) {
        // ignore
      }
    }
  }))
  .run();
