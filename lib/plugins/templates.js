const path = require('path');
const ejs = require('ejs');
const fs = require('fs');

module.exports = function templates(opts) {
  const options = Object.assign({}, {
    path: '',
    template: 'default.ejs',
    data: (file) => {
    },
    ejsOptions: false
  }, opts);

  return async (file) => {
    const templatePath = path.resolve(process.env.GENERATOR_CWD, options.path, options.template);
    const template = fs.readFileSync(templatePath, 'utf-8');

    file.contents = await ejs.render(
      template,
      Object.assign({}, {file}, options.data(file)),
      options.ejsOptions || {
        cache: true,
        filename: templatePath,
        views: []
      }
    );

    return file;
  }
};
