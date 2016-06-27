var config = {
  entry: __dirname + '/src/ReduxRecaptcha.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename: 'ReduxRecaptcha.js',
    library: 'ReduxRecaptcha',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    root: __dirname +  '/src',
    extensions: ['', '.js']
  }
};

module.exports = config;
