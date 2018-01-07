const Router = require('../lib/router');

test('initializes empty routes', () => {
  const router = new Router;

  expect(router.routes).toEqual({})
});

test('initializes object or routes', () => {
  const routes = {
    '/': {
      from: '/'
    }
  };
  const router = new Router(routes)

  expect(router.routes).toMatchObject(routes);
});

test('parses the routes', () => {
  const routes = {
    '/': {
      from: '/'
    }
  };
  const router = new Router(routes);

  expect(router.matchers.length).toEqual(1);
  expect(router.matchers[0].route).toEqual(routes['/']);
});

test('matcher.parse should return false if there is no match', () => {
  const routes = {
    '/': {
      from: '/'
    }
  };
  const router = new Router(routes);
  const res = router.matchers[0].parse('no match');
  expect(res).toEqual(false);
});

test('matcher.parse should match a simple route', () => {
  const routes = {
    '/': {
      from: '/'
    }
  };
  const router = new Router(routes);
  const res = router.matchers[0].parse('/');

  expect(res).toEqual({});
});

test('matcher.parse should match a route with parameters, and return them', () => {
  const routes = {
    '/': {
      from: '/:foo'
    }
  };
  const router = new Router(routes);
  const res = router.matchers[0].parse('/bar');

  expect(res.foo).toEqual('bar');
});

test('matcher.parse should match a route with repeating parameters, and return them as an array', () => {
  const routes = {
    '/': {
      from: '/:foo+'
    }
  };
  const router = new Router(routes);
  const res = router.matchers[0].parse('/bar/baz');

  expect(res.foo).toEqual(['bar', 'baz']);
});

test('matcher._build should build the url', () => {
  const routes = {
    '/': {
      from: '/'
    },
    '/:foo': {
      from: '/:foo'
    }
  };
  const router = new Router(routes);
  const res = router.matchers[0]._build();
  const res2 = router.matchers[1]._build({foo: 'bar'});

  expect(res).toEqual('/');
  expect(res2).toEqual('/bar');
});

test('should match routes', () => {
  const routes = {
    '/': {
      from: '/'
    }
  };
  const router = new Router(routes);

  expect(router.match('no match')).toEqual(false);
  expect(router.match('/')).toHaveProperty('route', routes['/']);
});

test('should contain parameters of the matched route', () => {
  const routes = {
    '/': {
      from: '/:foo'
    }
  };
  const router = new Router(routes);
  const res = router.match('/bar');

  expect(res).toHaveProperty('params');
  expect(res.params).toHaveProperty('foo', 'bar');
});

test('should build url with the matched parameters by default', () => {
  const routes = {
    '/res/:foo': {
      from: '/:foo'
    }
  };
  const router = new Router(routes);
  const res = router.match('/bar').build();

  expect(res).toEqual('/res/bar');
});

test('should build url with passed parameters', () => {
  const routes = {
    '/res/:foo': {
      from: '/:foo'
    }
  };
  const router = new Router(routes);
  const res = router.match('/bar').build({foo: 'baz'});

  expect(res).toEqual('/res/baz');
})