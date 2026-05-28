const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  mode: 'production',//can be changed to development
  devtool: 'source-map',//gives more error details
  entry: './scripts/scripts.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  externals: {
    vue: 'Vue'//do not compile vue because we have PDBVue
  },
  plugins: [
    new webpack.DefinePlugin({//removes warning flags
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false
    }),
    new VueLoaderPlugin()
  ]
};
