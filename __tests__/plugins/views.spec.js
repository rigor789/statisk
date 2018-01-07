jest.mock('edge.js', () => {
  return {
    registerViews: jest.fn(),
    render: jest.fn()
  }
});

const views = require('../../lib/plugins/views');
const edge = require('edge.js');

process.env.GENERATOR_CWD = '';

beforeEach(() => {
  jest.resetAllMocks();
});

test('should render single file', async () => {
  const plugin = views();

  const file = {
    contents: `the contents`,
    meta: jest.fn()
  };

  await plugin(file);

  expect(edge.registerViews.mock.calls.length).toEqual(1);
  expect(edge.render.mock.calls.length).toEqual(1);
  expect(edge.render.mock.calls[0][0]).toEqual('default');
  expect(file.meta.mock.calls.length).toEqual(1);
});

test('should ignore if there is no view specified', async () => {
  const plugin = views({
    view: false
  });

  const res = await plugin({
    contents: `the contents`,
    meta: () => ({})
  });

  expect(edge.render.mock.calls.length).toEqual(0);
  expect(res.contents).toEqual('the contents');
});

test('should process multiple files', async () => {
  const plugin = views();

  const file1 = {
    contents: `the contents`,
    meta: jest.fn()
  };
  const file2 = {
    contents: `the contents`,
    meta: jest.fn()
  };

  await plugin([file1, file2]);

  expect(edge.registerViews.mock.calls.length).toEqual(1);
  expect(edge.render.mock.calls.length).toEqual(2);
  expect(file1.meta.mock.calls.length).toEqual(1);
  expect(file2.meta.mock.calls.length).toEqual(1);
});