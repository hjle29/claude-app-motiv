const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// Parse .env file (supports both KEY=VALUE and KEY: VALUE formats)
const envVars = {};
try {
  const envFile = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
  for (const line of envFile.split('\n')) {
    const match = line.match(/^\s*([^#\s][^:=\s]*)\s*[:=]\s*(.*)\s*$/);
    if (match) envVars[match[1]] = match[2];
  }
} catch (_) {}


module.exports = {
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
    clean: true,
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: path.resolve(__dirname, 'babel.config.web.js'),
          },
        },
        // Transpile react-native-* and @react-navigation packages
        exclude:
          /node_modules\/(?!(react-native-|@react-navigation|@react-native-masked-view|@react-native\/assets-registry)\/).*/,
      },
      // Fix ESM "fully specified" resolution for @react-navigation packages
      {
        test: /\.js$/,
        resolve: { fullySpecified: false },
        include: /node_modules\/@react-navigation/,
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|ttf|otf|woff|woff2|eot)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.js',
      '.tsx',
      '.ts',
      '.js',
    ],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-mmkv': path.resolve(__dirname, 'src/web/mmkv.ts'),
      '@react-native-masked-view/masked-view': path.resolve(
        __dirname,
        'src/web/maskedView.ts',
      ),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
      'process.env': JSON.stringify({ NODE_ENV: 'development', ...envVars }),
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: 'body',
      scriptLoading: 'blocking',
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
};
