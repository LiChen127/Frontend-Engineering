## ES Module特性
1. ESM 自动采用严格模式, 忽略"use strict"
2. 每个ES Module都是运行的单独的私有作用域中
3. ESM是通过CORS的方式请求外部JS模块的
4. ESM的srcipt标签会延迟执行脚本 === 添加defer属性 等待网页渲染之后再执行
   

## ES Module功能
导入导出

导出 export
export单独使用 export { name, hello }
重命名 export { name as fooName }
默认导出 export default name

导入导出注意事项
export { name, age }这里并不是导出对象字面量,这只是一个固定的用法
export default { name, age } default后面跟的是一个值，实际上导出的是一个对象包裹着name和age

import { name, age } from '...'
import 并不是解构，和export一样是一个固定用法

export导出成员的时候导出的是成员的引用
export导出时暴露出来的是引用关系，只是可读的，并不能在外部修改


import 用法
动态导入模块 异步
import('./module.js').then(function(moudle){

})

直接导出所有导入的成员
export { foo, bar } from './module.js'

## 如何解决兼容性问题
Polyfill 兼容方案
esModule loader 
babel转换


### ES Module in Nodejs
