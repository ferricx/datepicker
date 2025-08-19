const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/controller/dp-controller.js'),
  output: {
    filename: 'dpapp.bundle.js', 
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
  // ... if using MiniCssExtractPlugin, add it to plugins array
};