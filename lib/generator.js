const readdirRec = require('recursive-readdir');
const path = require('path');
const fs = require('fs-extra');
const rm = require('rimraf');

const Pipeline = require('./pipeline');
const Router = require('./router');

class Generator {
  constructor({cwd, routes, source, destination, clean}) {
    this.cwd = cwd;
    this.router = new Router(routes);
    this.source = path.resolve(this.cwd, source);
    this.destination = path.resolve(this.cwd, destination);
    this.clean = clean;
    this.pipeline = new Pipeline();

    // allow chaining additional steps into the pipeline
    this.use = fn => {
      this.pipeline.use(fn);
      return this;
    };

    this.pipeline.use(async file => {
      return {
        paths: {
          abs: file,
          rel: path.relative(this.cwd, file)
        }
      };
    });

    this.pipeline.use(async file => {
      const matched = this.router.match(file.paths.rel);
      const contents = await fs.readFile(file.paths.abs);

      return Object.assign(file, {
        matched,
        contents
      })
    });

    this.pipeline.use(async file => {
      const pipeline = file.matched.route.pipeline
      if (pipeline) {
        // console.log('Running pipeline for file: ' + file.paths.rel);
        if (Array.isArray(pipeline)) {
          return new Pipeline(pipeline).runPipeline(file);
        } else if (pipeline instanceof Pipeline) {
          return file.matched.route.pipeline.runPipeline(file)
        } else {
          console.log('Invalid pipeline specified in route config.')
        }
      }

      return file;
    })
  }

  async run() {
    return this.pipeline
      .run(await readdirRec(this.source))
      .then(async files => {
        if (this.clean) {
          await new Promise((resolve) => rm(path.resolve(this.destination, '*'), resolve));
        }
        return files;
      })
      .then(async files => {
        for (const file of files) {
          // todo append index.html only if it's not present
          let relPath = file.matched.build() + 'index.html';
          relPath = relPath.replace(/^\//, '');
          const dest = path.resolve(this.destination, relPath);
          await fs.outputFile(dest, file.contents);
        }

        return files;
      });
  }
}

module.exports = Generator;
