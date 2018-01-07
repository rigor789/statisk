const markdown = require('../../lib/plugins/markdown');

test('should process markdown', async () => {
  const plugin = markdown();

  const res = await(plugin({
    contents: `the content`
  }));

  expect(res.contents).toMatch('<p>the content</p>');
});

test('should add messages to file object', async () => {
  const plugin = markdown();

  const res = await (plugin({
    contents: `the content`
  }));

  expect(res).toHaveProperty('messages');
  expect(res.messages.length).toEqual(1);
});

test('should not add messages to file object if there are no messages', async () => {
  const plugin = markdown();

  const res = await (plugin({
    contents: `the content\n`
  }));

  expect(res).not.toHaveProperty('messages');
});
