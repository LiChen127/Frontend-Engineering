const path = require("path");

module.exports = {
  mode:  'none',
  entry: "./src/main.js",
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'output'),
    publicPath: 'dist/', // 空字符串代表根目录 dist目录 dist/ 斜线不能省略
  },
  module: {
    rules: [
      {
        test: /.css$/,
        use: ['style-loader', 'css-loader']
      },
      // {
      //   test: /.png$/,
      //   use: 'file-loader'
      // }
      {
        test: /.png$/,
        use: 'file-loader'
      }
    ]
  }
}