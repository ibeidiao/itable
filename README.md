# itable

itable 是一个基于jquery的一个table插件。

它具有以下功能

- 表格内折叠 参数 `collapse: true;`
- 分页 参数 `pager: Object;`
- 排序 参数 `sort: true;`

## 开始

### 引入

  
  `<link rel="stylesheet" href="./itable.css">`
  
  `<script type="text/javascript" src="itable.js"></script>`
  
   也可以使用AMD模式
  
  `import ITable from './itable';`

### 使用
``` html
  <div id="table"></div>
```

``` javascript
  var myTable = new ITable('#table');
  
  myTable.render(config);
  
```

### API

- `render: void` 
  
  默认渲染方法。
  
- `getChecked: Array`
  
  获取被选中数据。
  
- `getData: Array`
    
  获取所有数据。
  
- `getStatus: object`
  
  获取表格状态。

- `destroy: void`

  销毁表格。


#### Config
  参数 | 类型 | 说明 | 示例值  
------- | ------- | ------- | -------
columns | Array | 一维数组。必填。 | 详见 表头参数
data | Array | 表格数据。 | 你自己的数据
done | function | 表格渲染完之后执行的方法。 | `function(){...}`
onChange | function | 表格状态变化之后的回调函数(表格状态包含pagerStatus/sortStatus)，提供一个 当前状态对象。 | `function(status) { ... }`
pager | object | 若不填则不渲染分页；若为Object则开启分页功能|详见 分页参数
sortStatus | obecjt | 若不填则表格没有默认排序状态。 | `{ field1: 'asc', field2: 'desc' }`
loadChildren| function | 获取此行子数据方法，只有在特定情况下才会触发。提供需要展开的当前数据和一个回调函数，回调函数渲染子行，需传入data。 | `function(item, cb) {...}`


#### 表头参数

  参数 | 类型 | 说明 | 示例值  
------- | ------- | ------- | -------
checkbox | boolean | 多选框 | `true`
width | number | 列宽度／必填 | `100`
field | string | 取值的字段名 |`'person'`
title | string | 表头名 | `'候选人'`
sort | boolean | 此列是否有排序 | `true`
collapse | boolean | 展开按钮是否在此列，只能有一个为`true` | `true`
align | string | `'right'` / `'center'` / `'left'` | `'center'`
click | function | checkbox独有，点击时回调，提供此列数据 | `function(item){...}`
render | function | 单元格渲染函数，提供此列数据以及单元数据(如果提供了`field`参数)，还有一个`index` | `function(field, item, i) {...} `


#### 分页参数

  参数 | 类型 | 说明 | 示例值  
------- | ------- | ------- | -------
count | number | 数据总条数／必填 | `100`
size | number | 一页多少条／默认值： `10` | `10`
curr | number | 当前页数／默认值： `1` | `1`

