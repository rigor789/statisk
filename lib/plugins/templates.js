const path = require('path');
const pretty = require('pretty');
const ejs = require('ejs');
const fs = require('fs');

module.exports = function templates(opts) {
  const options = Object.assign({}, {
    path: '',
    template: 'default.ejs',
    data: (file) => {
    },
    render: ejs.render,
    rendererOptions: false,
    pretty: true,
  }, opts);

  return async (file) => {
    const templatePath = path.resolve(process.env.GENERATOR_CWD, options.path, options.template);
    const template = fs.readFileSync(templatePath, 'utf-8');

    file.contents = await options.render(
      template,
      Object.assign({}, {file}, options.data(file)),
      options.rendererOptions || {
        cache: true,
        filename: templatePath
      }
    );

    if (options.pretty) {
      file.contents = pretty(file.contents, {ocd: true});
    }

    return file;
  }
};
