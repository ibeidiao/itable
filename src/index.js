
import ITable from './itable';
import $ from 'jquery';

import CheckBox from './CheckBox';

$('body').append($('<div style="width: 100%;"></div>').append($('<div id="table" style="margin: auto;width: 100%; min-width: 1000px; max-width: 1200px;"></div>')));
$('body').append('<button id="getData">获取data</button>');

const data = [
  { person: '张三丰1', type: '基础版', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '已出报告（第一版）' },
  { person: '张三丰2', type: '极速版', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '已出报告（最终版）' },
  { person: '张三丰3', type: '基础背调服务', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '待上传资料' },
  { person: '张三丰4', type: '基础背调服务', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '待候选人授权' },
  { person: '张三丰5', type: '基础背调服务', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '调查进行中', children: true },
  { person: '张三丰6', type: '基础背调服务', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '待候选人授权', children: [
    { person: '张三丰7', type: '基础背调服务', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '待上传资料' },
    { person: '张三丰8', type: '基础背调服务', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '待候选人授权', children: true },
  ] },
  { person: '张三丰11', type: '基础背调服务', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '调查进行中' },
  ];

function actionsWrapRender(item) {
  return '<div class="actions-wrap"><a>详情</a><a>下载报告</a><a class="more-action">更多<i class="iconfont ibd-icon-jiantou-down"></i></a></div>';
  }
  var k = 0;
  function personRender(person, item) {
  if (k === 0){
    k ++;
    return '<div class="person-wrap">' + person + '<i class="table-dian gray iconfont ibd-icon-dian-copy-copy-copy"></i></div>';
  } else if (k < 3) {
    k ++;
    return '<div class="person-wrap">' + person + '<i class="table-dian red iconfont ibd-icon-dian-copy-copy-copy"></i></div>';
  } else {
    k ++;
    return '<div class="person-wrap">' + person + '</div>';
  }
}

function statusRender(status) {
  if (status === '已出报告（第一版）') {
    return '<div class="status-wrap" style="color: #46b8b3;">' + status + '<i class="iconfont ibd-icon-dian-copy-copy-copy"></i></div>';
  } else if (status === '已出报告（最终版）') {
    return '<div class="status-wrap" style="color: #f8952a;">' + status + '<i class="iconfont ibd-icon-dian-copy-copy-copy"></i></div>'
  } else if (status === '待上传资料') {
    return '<div class="status-wrap">' + status + '<i class="iconfont ibd-icon-dian-copy-copy-copy" style="color: #8f83ba;"></i></div>'
  } else if (status === '待候选人授权') {
    return '<div class="status-wrap">' + status + '<i class="iconfont ibd-icon-dian-copy-copy-copy" style="color: #8f83ba;"></i></div>'
  } else if (status === '调查进行中') {
    return '<div class="status-wrap">' + status + '<i class="iconfont ibd-icon-dian-copy-copy-copy" style="color: #80cef2"></i></div>'
  }
}

var unitWidth = document.getElementById('table').clientWidth / 24;

var myTable = new ITable('#table');
myTable.render({
  columns: [
    { checkbox: true, width: unitWidth, click: function(item) { console.log(item); } },
    { field: 'person', title: '候选人',  render: personRender, width: unitWidth * 2, collapse: true, sort: true },
    { field: 'type', title: '套餐类型', width: unitWidth * 4, sort: true },
    { field: 'createTime', title: '创建时间', width: unitWidth * 3, sort: true },
    { field: 'jiaofu', title: '预计交付时间', width: unitWidth * 3, filter: [{ text: '状态1', val: 1 }, { text: '状态2', val: 2 }] },
    { field: 'status', title: '背调状态', render: statusRender, width: unitWidth * 5, filter: [{ text: '状态1', val: 1 }, { text: '状态2', val: 2 }] },
    { title: '操作', render: actionsWrapRender, width: unitWidth * 6 }
  ],
  data: data,
  done: function() {
    $('.actions-wrap a').on('click', function() {
      console.log(22);
    });
    $('#getData').on('click', function() {
      console.log(myTable.getChecked());
    });

    // console.log(myTable.getStatus());
  },
  loadChildren: function(item, cb) {
    console.log('需要加载的子数据', item);
    cb([
      { person: '张三丰12', type: '基础背调服务', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '待上传资料' },
      { person: '张三丰13', type: '基础背调服务', createTime: '2017.09.12', jiaofu: '2017.09.18', status: '待候选人授权' },
    ]);
  },
  pager: { count: 101 },
  onChange: function(status) {
    console.log(status);
    myTable.render({ pager: status.pager });
  },
  sortStatus: {
    person: 'asc',
  },
  filterStatus: {
    status: [1],
    jiaofu: [2]
  }
});


