const matter = require('../../lib/plugins/matter');

test('should work if there is no matter', async () => {
  const plugin = matter();

  const file = await plugin({
    contents: 'the content'
  });

  expect(file.matter).toEqual({});
  expect(file.contents).toEqual('the content')
});

test('should work if there is matter', async () => {
  const plugin = matter();

  const file = await plugin({
    contents: '---\nfoo: bar\n---\nthe content'
  });

  expect(file.matter).toEqual({foo: 'bar'});
  expect(file.contents).toEqual('the content');
});