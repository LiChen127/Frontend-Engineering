## webpack 默认
"src/index.js" -> "dist/main.js"

Webpack配置文件
根目录添加webpack.config.js
这个文件是一个运行在Node环境当中的Commonjs文件

const path = require("path");

module.exports = {
  entry: "./src/index.js", // 入口
  output: { // 出口 应该是一个对象
    filename: 'bundle.js',
    // path: 'output' // path必须是一个绝对路径
    path: path.join(__dirname, 'output')
  }
}

webpack 工作模式
WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value.
执行webpack的时候的警告
什么意思呢?
就是我们没有设置mode属性，webapck默认使用production生产环境

yarn webpack --mode development 开发模式下自动优化打包速度
yarn webpack --mode none 原始模式不做任何额外的处理
yarn webpack --mode production 生产环境打包

可以在webpack.config.js中配置mode
webpack做的事情没有那么复杂，其实就是把我们所有的模块都放到了同一个文件当中，还提供了一些基础的代码，使得这些模块依然保持依赖关系。

webpack 资源模块加载
但是webpack内部默认只会处理JavaScript文件它会把遇到的所有文件都当作JavaScript文件去解析
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
我们要配置this file type's loader
也就是说webpack可以用loader加载器来处理文件
const path = require("path");

module.exports = {
  mode:  'none',
  // entry: "./src/index.js", // 入口
  entry: "./src/main.css",
  output: { // 出口 应该是一个对象
    filename: 'bundle.js',
    // path: 'output' // path必须是一个绝对路径
    path: path.join(__dirname, 'output')
  },
  module: {
    rules: [
      {
        test: /.css$/,
        use: 'css-loader'
      }
    ]
  }
}
css-loader的作用就是将css文件编写为js模块
这里还需要style-loader 将css转换后的结果通过style标签的形式追加到页面上
rules: [
  {
    test: /.css$/,
    use: ['css-loader', "style-loader"]
  }
]
注意：从后往前执行，先执行最后一个loader
Loader是实现前端模块化的核心，通过不同的loader可以加载任何类型的资源


webpack 导入资源模块
打包入口某种程度来说是我们应用的运行入口
正确的做法还是js文件作为打包入口,然后在js代码中import css的文件

webpack 的哲学: 真正需要资源的不是应用而是代码

webpack 文件资源加载器
