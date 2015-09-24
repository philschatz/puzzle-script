var path = require('path');
var webpack = require('webpack');

var config = {
  context: path.resolve(__dirname),
  entry: [
    './js/index.js'
  ],
  output: {
    // library: 'PuzzleScript',
    libraryTarget: 'umd',
    path: __dirname + '/dist',
    publicPath: '/dist/',
    filename: 'bundle.js'
  },
  module: {
    // preLoaders: [
    //   { test: /\.js$/, loader: 'eslint-loader', exclude: /node_modules/ },
    // ],
    loaders: [
      //TODO: re-enable use-strict
      { test: /\.js$/, loaders: ['babel?blacklist=useStrict'], exclude: /node_modules/ },
    ]
  },
};

module.exports = config;
