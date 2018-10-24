/* eslint-disable global-require */
const path = require('path');
const webpack = require('webpack');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { nodeModules, babelrc } = require('./utils');
const vendors = require('../vendors');

const config = {
  name: 'client',
  target: 'web',
  entry: {
    main: [
      ...vendors,
      path.resolve(__dirname, `../client/public-path.js`),
      path.resolve(__dirname, `../client`),
    ],
  },
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, `../../.build/${process.env.MODE}/client`),
  },
  resolve: {
    modules: nodeModules,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            ...babelrc.prodClient,
          },
        },
      },
      {
        test: /\.css$/,
        use: ExtractCssChunks.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          ],
        }),
      },
    ],
  },
  plugins: [
    new ExtractCssChunks(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['bootstrap'], // needed to put webpack bootstrap code before chunks
      filename: '[name].[chunkhash].js',
      minChunks: Infinity,
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        MODE: JSON.stringify(process.env.MODE),
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false,
      },
      mangle: {
        screw_ie8: true,
      },
      output: {
        screw_ie8: true,
        comments: false,
      },
      sourceMap: false,
    }),
    new webpack.WatchIgnorePlugin([/\.build/]),
    new webpack.IgnorePlugin(
      /vertx|redux-logger|redux-devtools-extension|redbox-react|mobx-devtools-mst/,
    ),
    new LodashModuleReplacementPlugin({
      currying: true,
    }),
    new ProgressBarPlugin(),
  ],
};

if (process.env.ANALYZE) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  const Visualizer = require('webpack-visualizer-plugin');
  config.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../../analyize/pwa/client-prod-analyzer.html',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: '../../analyize/pwa/client-prod-stats.json',
    }),
  );
  config.plugins.push(
    new Visualizer({
      filename: '../../analyize/pwa/client-prod-visualizer.html',
    }),
  );
}

module.exports = config;
