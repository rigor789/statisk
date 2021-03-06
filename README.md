# Statisk [![Build Status](https://img.shields.io/circleci/project/rigor789/static-builder/master.svg)](https://circleci.com/gh/rigor789/static-builder) [![Codecov](https://img.shields.io/codecov/c/github/rigor789/static-builder.svg)](https://codecov.io/gh/rigor789/static-builder)

<p align="center">
    <a href="https://github.com/rigor789/statisk">
        <img src="logo.png">
    </a>
</p>


This is a little experiment for building a static site generator that is based around routes.

Think of it like you define the desired routes, but instead of controllers (from a typical mvc application) the "routes" are matched from files.

For example

```js
const routes = {
    // the / route will be matched from content/index.html
    '/': {
        from: 'content/index.html'
    },
    // :slug is a variable that will be taken from the file name
    '/blog/:slug/': {
        from: 'content/posts/:slug.md'
    },
    // :path+ means a repeating pattern, so we can deeply nest
    // for example categories
    '/categories/:path+/': {
        from: 'content/categories/:path+.md'
    }
    // parameters can also be optional using the :param? syntax
    // see https://www.npmjs.com/package/path-to-regexp for all
    // available types of parameters.
};
```

By default every file will be run through a default `pipeline`, which will basically read the contents of the file, and then write a new file in the `dist` folder at the given path.

In many cases we want to apply different transformations to a file, this is done by specifying a `pipeline` in the route definition.

The `pipeline` property can be an array of async functions (or promises)
or an instance of the `lib/Pipeline` class.

## What's a pipeline?

A pipeline is just a simple chain of functions. The order is important, because every function in the pipeline will be run one after another.

> Important: always return a value from a pipeline function, because the next function in the line will receive it as the parameter, and if you forget to return, the data will be "lost".

### Example pipeline

```js
const routes = {
    '/blog/:slug/': {
        from: 'content/posts/:slug.md',
        pipeline: [
            matter      // parses front matter
            markdown    // transforms markdown to html
            async file => {
                // a step in the pipeline is just an async function

                // file.content is a Buffer by default, to allow
                // working with binary files
                file.content = file.content.toString().toUpperCase();
                return file;
            }
        ]
    },
}
```

This is a very simple example, and in some cases handling it inline can be tedious. When the routes definition gets out of hand, it's a good idea to move the pipeline definition into it's own file, and then require it in the route definition.

## License

Released under the MIT license.
