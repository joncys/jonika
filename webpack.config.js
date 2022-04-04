const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    historyApiFallback: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: ['@babel/preset-env', '@babel/preset-typescript']
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Jonika',
      favicon: 'src/favicon.ico',
      template: 'src/index.html'
    }),
    new ForkTsCheckerWebpackPlugin()
  ],
  output: {
    filename: 'dist.js',
    path: path.resolve(__dirname, 'dist')
  }
}
