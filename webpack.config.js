const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/dp-controller.js',
  output: {
    filename: 'datepicker-web-component.bundle.js', 
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          // In development:
          'style-loader', // Injects CSS into the DOM
          // In production:
          // MiniCssExtractPlugin.loader, // Extracts CSS into separate files

          'css-loader', // Interprets @import and url() like import/require()
          'sass-loader', // Compiles Sass to CSS
        ],
      },
   
      // ... other rules for JavaScript (e.g., Babel for ES Modules)
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'src/template.html', 
          to: './',
        },
      ],
    })
    // new HtmlWebpackPlugin({
    //   template: './src/index.html',
    //   filename: 'index.html',
    //   inject: 'body'
    // }),
  ],
  // ... if using MiniCssExtractPlugin, add it to plugins array
};