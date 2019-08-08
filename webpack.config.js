const path = require('path');

module.exports = {
  entry: 'main',
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: 'bundle.js',
    publicPath: 'dist'
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 9000
  },
  resolve: {
    modules: ['node_modules', 'src']
  },
};
