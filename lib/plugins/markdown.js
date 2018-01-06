const remark = require("remark");
const lint = require("remark-preset-lint-recommended");
const html = require("remark-html");
const report = require("vfile-reporter");

function processMarkdown(contents) {
  return new Promise((resolve, reject) => {
    remark()
      .use(lint)
      .use(html)
      .process(contents, (err, file) => {
        if (err) reject(err);

        resolve(file);
      });
  });
}

module.exports = async function markdown(file) {
  try {
    const res = await processMarkdown(file.contents);

    if (res.messages.length > 0) {
      file.messages = (file.messages || []).concat(res.messages);
    }
    file.contents = res.toString();
  } catch (err) {
    console.log(`${file}: ${report(err)}`);
  }

  return file;
};
