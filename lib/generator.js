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
  constructor({cwd, routes, sources, source, destination, clean, verbose, debug, meta}) {
    process.env.GENERATOR_CWD = this.cwd = cwd;
    this.router = new Router(routes);
    this.sources = sources || [source];
    this.destination = path.resolve(this.cwd, destination);
    this.clean = clean;
    this.pipeline = new Pipeline();
    this.verbose = verbose;
    this.debug = debug;
    this.meta = meta || {};

    this.sources = this.sources.map(source => path.resolve(this.cwd, source));

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
        },
        meta: () => this.meta
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

    const sources = await Promise.all(
      this.sources.map(source => readdirRec(source))
    );

    return this.pipeline
      .run(sources)
      .then(async sources => {
        if (this.clean) {
          await new Promise(resolve =>
            rm(path.resolve(this.destination, "*"), resolve)
          );
        }
        return sources;
      })
      .then(async sources => {
        for (let files of sources) {
          files = files.filter(f => !!f);
          const vfiles = files.map(file =>
            vfile({path: file.paths.rel, messages: file.messages || []})
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
            let relPath = file.matched.build();
            relPath = relPath.replace(/^\//, "");
            this.verbose && spinner.info("writing " + relPath).start();
            const dest = path.resolve(this.destination, relPath);
            await fs.outputFile(dest, file.contents);
          }

          spinner.succeed(`Pipeline Completed`);
        }

        const endTime = new Date().getTime();
        const elapsed = endTime - startTime;
        spinner.succeed(`Build Complete in ${chalk.cyan(`${elapsed}ms`)}`);

        return sources;
      })
      .catch(err => {
        spinner.fail(err);
        this.debug && console.log(err);
      });
  }
}

module.exports = Generator;
