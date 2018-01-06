class Pipeline {
  constructor(fns = []) {
    this.pipeline = fns;
  }

  use(fn) {
    if (typeof fn !== "function") {
      throw new Error(
        "pipeline.use() expects a function, but received " + typeof fn
      );
    }
    this.pipeline.push(fn);
    return this;
  }

  runPipeline(item) {
    const line = this.pipeline.concat(async i => i);
    return line.reduce((prev, curr) => {
      return prev.then(res => {
        if (res) {
          return curr(res);
        }

        throw new Error(
          "a function in the pipeline yielded no result, did you forget to return?"
        );
      });
      // return prev.then(curr);
    }, Promise.resolve(item));
  }

  async run(items = []) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    let processed = [];
    while (items.length) {
      processed.push(await this.runPipeline(items.shift()));
    }
    return processed;
  }
}

module.exports = Pipeline;
