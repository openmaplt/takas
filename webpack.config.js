const path = require('path');

module.exports = (env, options) => {
  return {
    entry: {
      app: './src/app.js',
      viewer: './src/routeapp.js'
    },
    output: {
      filename: '[name]bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    devtool: (options.mode === 'development') ? 'inline-source-map' : false,
    devServer: {
      contentBase: './dist',
      hot: true,
      port: 9000,
      proxy: {
        '/php': {
          target: 'http://localhost/takas/php',
          secure: false,
          pathRewrite: { '^/php': '' }
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    }
  }
};
