const path = require('path');
const edge = require('edge.js');
const pretty = require('pretty');

/**
 * The views plugin is meant to build the final layouts
 * of the given files. It uses edge by default which supports
 * extending layouts and thus it's a good choice for defining
 * layouts.
 *
 * @param opts
 * @returns {function(*)}
 */
module.exports = function layouts(opts) {
  const options = Object.assign({}, {
    path: 'views',
    view: file => 'default',
    data: file => {
      // no op
    },
    pretty: true,
  }, opts);

  edge.registerViews(path.resolve(process.env.GENERATOR_CWD, options.path));

  const renderFile = async file => {
    const view = typeof options.view === 'function'
      ? options.view(file)
      : options.view;

    if (!view) {
      return file;
    }

    file.contents = edge.render(
      view,
      Object.assign({}, {
        meta: file.meta()
      }, options.data(file))
    );

    if (options.pretty) {
      file.contents = pretty(file.contents, {ocd: true});
    }

    return file;
  };

  return async (file) => {
    if (Array.isArray(file)) {
      return await Promise.all(file.map(renderFile))
    }

    return await renderFile(file);
  }
};
