class Pipeline {

  constructor(fns = []) {
    this.pipeline = fns;
  }

  use(fn) {
    this.pipeline.push(fn);
    return this;
  }

  runPipeline(file) {
    return this.pipeline.reduce((prev, curr) => {
      return prev.then(curr);
    }, Promise.resolve(file))
  }

  async run(items = []) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    let processed = [];
    while (items.length) {
      processed.push(await this.runPipeline(items.shift()))
    }
    return processed;
  }
}

module.exports = Pipeline;