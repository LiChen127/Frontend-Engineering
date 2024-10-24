/**
 * 模块化规范的出现 + 模块自动加载器
 * CommonJS规范:
 * 1.一个文件就是一个模块
 * 2.每个模块都有一个单独的作用域
 * 3.通过module.exports导出成员
 * 4.通过require函数载入模块
 * 
 * 但是CommonJS这种规范在Node中没有问题，因为Node的执行机制是在启动时去加载模块，执行过程中不需要加载
 * 但是浏览器端不行。
 * 早期浏览器端规范:
 * AMD(Asynchronous Module Definition) + require.js 异步的模块定义规范
 * 约定我们的每一个模块都必须要通过define函数来定义
 * 定义一个模块，包括模块名，模块函数，模块包含的变量
 * 只是一种妥协的解决方式，是一种约定
 * CMD + Sea.js 类似AMD的重复的轮子
 * 
 */

// 目前浏览器端ES Module Nodejs端用CommonJS || ES Module
