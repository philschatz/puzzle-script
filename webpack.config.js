var path = require("path");
var webpack = require('webpack');

var isBuild = process.env['BUILD'];

var config = {
    context: path.resolve(__dirname),
    entry: [
      // './style/index.js',
      './js/index.js'
    ],
    output: {
        path: __dirname + '/dist',
        publicPath: '/dist/',
        filename: 'bundle.js'
    },
    plugins: [
      new webpack.NoErrorsPlugin(),
      // new ExtractTextPlugin('app.css')
    ],
    module: {
        // preLoaders: [
        //   { test: /\.jsx?$/, loader: 'eslint-loader', exclude: /node_modules/ },
        // ],
        loaders: [
            { test: /\.jsx?$/, loaders: ['babel?blacklist=useStrict'], exclude: /node_modules/ }, //TODO: re-enable use-strict
            // { test: /\.less$/,  loader: ExtractTextPlugin.extract('css!less') },
            // { test: /\.(png|jpg|svg)/, loader: 'file-loader?name=[name].[ext]'},
            // { test: /\.(woff|woff2|eot|ttf)/, loader: "url-loader?limit=30000&name=[name]-[hash].[ext]" }
        ]
    },
    // resolve: {
    //   alias: {
    //     xmlhttprequest: path.join(__dirname, '/src/hacks/xmlhttprequest-filler.js'),
    //   },
    // },
};

if (!isBuild) {
  // config.debug = true;
  config.devtool = 'inline-source-map';
  // config.entry.unshift('webpack/hot/only-dev-server');
  config.entry.unshift('webpack-dev-server/client?http://0.0.0.0:8080');
  // config.devServer.hotComponents = true;
}

module.exports = config;
