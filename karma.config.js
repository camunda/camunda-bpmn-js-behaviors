var path = require('path');

var singleStart = process.env.SINGLE_START;

var coverage = process.env.COVERAGE;

var basePath = '.';

var absoluteBasePath = path.resolve(path.join(__dirname, basePath));

var suite = coverage ? 'test/coverage.js' : 'test/suite.js';

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'Safari' ]
var browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(karma) {
  var config = {

    basePath,

    frameworks: [
      'webpack',
      'mocha',
      'sinon-chai'
    ],

    files: [
      suite
    ],

    preprocessors: {
      [ suite ]: [ 'webpack', 'env' ]
    },

    reporters: [ 'progress' ].concat(coverage ? 'coverage' : []),

    coverageReporter: {
      reporters: [
        { type: 'lcov', subdir: '.' }
      ]
    },

    browsers,

    browserNoActivityTimeout: 30000,

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(css|bpmn)$/,
            type: 'asset/source'
          }
        ].concat(
          coverage ? {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                plugins: [
                  [ 'istanbul', {
                    include: [
                      'lib/**'
                    ]
                  } ]
                ],
              }
            }
          } : []
        )
      },
      resolve: {
        modules: [
          'node_modules',
          absoluteBasePath
        ]
      },
      devtool: 'eval-source-map'
    }
  };

  if (singleStart) {
    config.browsers = [].concat(config.browsers, 'Debug');
    config.envPreprocessor = [].concat(config.envPreprocessor || [], 'SINGLE_START');
  }

  karma.set(config);
};