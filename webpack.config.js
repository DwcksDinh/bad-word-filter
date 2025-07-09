const path = require('path');
const webpack = require('webpack');

const createConfig = (target, format) => ({
  mode: 'production',
  entry: './src/browser.ts',
  output: {
    path: path.resolve(__dirname, 'dist/browser'),
    filename: format === 'umd' ? 'bad-word-filter.min.js' : 'bad-word-filter.esm.js',
    library: format === 'umd' ? 'BadWordFilter' : undefined,
    libraryTarget: format === 'umd' ? 'umd' : 'module',
    globalObject: 'this',
    clean: false
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  optimization: {
    minimize: true
  },
  experiments: format === 'esm' ? {
    outputModule: true
  } : undefined
});

module.exports = [
  createConfig('web', 'umd'),
  createConfig('web', 'esm')
];