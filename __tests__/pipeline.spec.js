const Pipeline = require('../lib/pipeline');

const noop = () => {
}

test('initialize with no parameter', () => {
  const pipe = new Pipeline;

  expect(pipe.pipeline).toEqual([]);
});

test('initialize with array', () => {
  const fns = [noop];
  const pipe = new Pipeline(fns);

  expect(pipe.pipeline.length).toEqual(1);
  expect(typeof pipe.pipeline[0]).toEqual('function');
});

test('constructor throw error when not a function', () => {
  expect(() => {
    new Pipeline(['not a function'])
  }).toThrow('expects a function')
});

test('use should add functions to the pipeline', () => {
  const pipe = new Pipeline;
  pipe.use(noop);

  expect(pipe.pipeline.length).toEqual(1);
});

test('use should be chainable', () => {
  const pipe = new Pipeline;

  const ret = pipe.use(noop).use(noop);

  expect(ret).toEqual(pipe);
  expect(pipe.pipeline.length).toEqual(2);
});

test('runPipeline should run a given item through all functions in sequence', async () => {
  const pipe = new Pipeline;
  const item = {a: 1};

  pipe
    .use((item) => {
      item.b = 2;
      return item;
    })
    .use((item) => {
      item.c = 3;
      return item;
    });

  const res = await pipe.runPipeline(item);

  expect(res.a).toEqual(1);
  expect(res.b).toEqual(2);
  expect(res.c).toEqual(3);
});

test('runPipeline should warn if a function didn\'t return', async () => {
  const pipe = new Pipeline;
  const item = {a: 1};
  pipe.use(noop);

  try {
    await pipe.runPipeline(item);
  } catch (e) {
    expect(e.message).toMatch('no result');
  }
});

test('run should run an array of items through the pipeline individually and return an array of results', async () => {
  const pipe = new Pipeline;
  pipe.use(item => {
    item.b = 1;
    return item;
  });

  const items = [{a: 1}, {a: 2}];
  const res = await pipe.run(items);

  expect(res.length).toEqual(2);
  expect(res[0].a).toEqual(1);
  expect(res[0].b).toEqual(1);
  expect(res[1].a).toEqual(2);
  expect(res[1].b).toEqual(1);
});

test('run should accept a single item', async () => {
  const pipe = new Pipeline;
  const item = {a: 1};

  pipe.use(item => {
    item.b = 1;
    return item;
  });

  const res = await pipe.run(item);

  expect(res.length).toEqual(1);
  expect(res[0].a).toEqual(1);
  expect(res[0].b).toEqual(1);
});