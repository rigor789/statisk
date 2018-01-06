const readdirRec = require("recursive-readdir");
const path = require("path");
const fs = require("fs-extra");
const rm = require("rimraf");
const ora = require("ora");
const chalk = require("chalk");
const report = require("vfile-reporter-pretty");
const vfile = require("vfile");

const Pipeline = require("./pipeline");
const Router = require("./router");

global.spinner = ora({});

class Generator {
  constructor({ cwd, routes, source, destination, clean, verbose, debug }) {
    this.cwd = cwd;
    this.router = new Router(routes);
    this.source = path.resolve(this.cwd, source);
    this.destination = path.resolve(this.cwd, destination);
    this.clean = clean;
    this.pipeline = new Pipeline();
    this.verbose = verbose;
    this.debug = debug;

    // allow chaining additional steps into the pipeline
    this.use = fn => {
      this.pipeline.use(fn);
      return this;
    };

    this.pipeline.use(async files => {
      return files.map(file => ({
        paths: {
          abs: file,
          rel: path.relative(this.cwd, file)
        }
      }));
    });

    this.pipeline.use(async files => {
      const filesP = files.map(async file => {
        const matched = this.router.match(file.paths.rel);
        const contents = await fs.readFile(file.paths.abs);

        if (!matched) {
          spinner.warn(
            "No route definition found for: " + chalk.yellow(file.paths.rel)
          );
          return false;
        }

        return Object.assign(file, {
          matched,
          contents
        });
      });

      spinner.start("matching files to routes");
      files = await Promise.all(filesP);
      files = files.filter(f => !!f);
      spinner.succeed("matched files to routes").start();

      return files;
    });

    this.pipeline.use(async files => {
      const filesP = files.map(async file => {
        const pipeline = file.matched.route.pipeline;

        if (pipeline) {
          // console.log('Running pipeline for file: ' + file.paths.rel);
          if (Array.isArray(pipeline)) {
            return new Pipeline(pipeline).runPipeline(file);
          } else if (pipeline instanceof Pipeline) {
            return file.matched.route.pipeline.runPipeline(file);
          } else {
            spinner.warn("Invalid pipeline specified in route config.").start();
          }
        }

        return file;
      });

      files = await Promise.all(filesP);
      return files;
    });
  }

  async run() {
    const startTime = new Date().getTime();
    spinner.start("Build in progress");

    return this.pipeline
      .run([await readdirRec(this.source)])
      .then(files => files[0])
      .then(async files => {
        if (this.clean) {
          await new Promise(resolve =>
            rm(path.resolve(this.destination, "*"), resolve)
          );
        }
        return files;
      })
      .then(async files => {
        files = files.filter(f => !!f);

        const vfiles = files.map(file =>
          vfile({ path: file.paths.rel, messages: file.messages || [] })
        );
        const rep = report(vfiles);

        if (rep) {
          spinner.warn("Processing finished with the following warnings:");
          console.log(rep);
          spinner.start();
        } else {
          spinner.succeed("processed files").start();
        }

        for (const file of files) {
          // todo append index.html only if it's not present
          let relPath = file.matched.build() + "index.html";
          relPath = relPath.replace(/^\//, "");
          this.verbose && spinner.info("writing " + relPath).start();
          const dest = path.resolve(this.destination, relPath);
          await fs.outputFile(dest, file.contents);
        }

        const endTime = new Date().getTime();
        const elapsed = endTime - startTime;
        spinner.succeed(`Build Complete in ${elapsed}ms`);

        return files;
      })
      .catch(err => {
        spinner.fail(err);
        this.debug && console.log(err);
      });
  }
}

module.exports = Generator;
