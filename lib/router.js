const pathToRegexp = require('path-to-regexp');

class Router {
  constructor(routes) {
    this.routes = routes;
    this.matchers = [];

    this.parseRoutes();
  }

  parseRoutes() {
    this.matchers = Object.keys(this.routes).map(route => {
      let keys = [];
      const matcher = pathToRegexp(this.routes[route].from, keys);
      const builder = pathToRegexp.compile(route);
      return {
        route: this.routes[route],
        parse: (path) => {
          const res = matcher.exec(path);
          if (!res) {
            return false;
          }

          return res.splice(1).reduce((params, current, index) => {
            const key = keys[index];
            let value = current;
            if (key.repeat) {
              value = current.split(key.delimiter);
            }

            params[key.name] = value;
            return params;
          }, {});
        },
        _build: p => builder(p),
      };
    })
  }

  match(path) {
    let params = null;
    const matched = this.matchers.find(m => {
      params = m.parse(path);
      return !!params;
    });

    // clone matched and assign params to it
    return Object.assign({}, matched, {
      params,
      build: (p) => matched._build(p || params)
    })
  }
}

module.exports = Router;