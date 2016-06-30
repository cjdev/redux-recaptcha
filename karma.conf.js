var webpack = require('./webpack.config');

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      'src/**/*.js',
      'test/**/*.js'
    ],
    preprocessors: {
      'src/*.js': ['eslint', 'webpack'],
      'test/*.js': ['eslint', 'webpack']
    },
    webpack: webpack,
    webpackMiddleware: {
        noInfo: true
    },
    eslint: {
      stopOnWarning: true
    },
    browsers: ['PhantomJS']
  });
};
