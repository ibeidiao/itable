import $ from 'jquery';

import CheckBox from './CheckBox';

import createTable from './createTable';
import createBody, { createTrs } from './createBody';
import './index.css';

const defaultConfig = {
    
};

let TABLE_INDEX = 1;

function ITable(elem) {

  const $elem = $(elem).addClass('i-table');
  const _INDEX_ = TABLE_INDEX;
  const cbs = [];
  let active = true;
  let tableConfig;

  // 下一个table做准备。
  TABLE_INDEX += 1;
  return {
    render: function(config) {
      if (!active) {
        throw new Error('this table is inactive');
      };
      tableConfig = { ...defaultConfig, ...config };

      const $tableBox = $('<div class="i-table-box"></div>');

      $tableBox
        .append(createHeader(tableConfig.columns, _INDEX_))
        .append(createBody(tableConfig.columns, tableConfig.data, _INDEX_));

      $elem
        .append($tableBox)
        .append(createStyle(tableConfig.columns, _INDEX_));
      
      // checkbox 相关
      const hasCheckBox = $elem.find('.i-table-cell-check-box').length > 0;
      const cbClick = hasCheckBox && getCbClick(tableConfig);
      hasCheckBox && initCheckBox($elem, cbs, cbClick);

      // 滚动相关
      $elem.find('.i-table-body').scroll(function() {
        $elem.find('.i-table-header')[0].scrollLeft = this.scrollLeft;
      });

      // 收缩相关
      $elem.find('.i-table-collapse').on('click', function() {
        // open时 为开的状态，那么 -> colse
        // close时 为关的状态，那么 -> open
        const $this = $(this);
        const collapsed = $(this).hasClass('i-table-collapse-open');
        const $parentTr = $this.parents('tr');
        const level = $parentTr.data('level');
        const needLoaded = !$parentTr.data('childrenLoaded');
        if (collapsed) {
          let $nextTr = $parentTr.next('tr');
          // 收缩
          $this
            .removeClass('i-table-collapse-open')
            .addClass('i-table-collapse-close');
          while ($nextTr.data('level') > level) {
            $nextTr.hide();
            $nextTr.find('.i-table-collapse').removeClass('i-table-collapse-open').addClass('i-table-collapse-close');
            $nextTr = $nextTr.next('tr');
          }
        } else {
          if (needLoaded) {
            const dataIndex = $parentTr.data('index');
            (typeof tableConfig.loadChildren === 'function' 
              && 
            tableConfig.loadChildren((function getTrData($tr) {
              if ($tr.data('level') === 0) { return tableConfig.data[$tr.data('index')] }
              const $parentTr = $($tr.prevAll(`tr[data-level="${$tr.data('level') - 1}"]`)[0]);
              return getTrData($parentTr).children[$tr.data('index')];
            })($parentTr), (children) => {
              $parentTr.after($(createTrs(tableConfig.columns, children, _INDEX_, level + 1)));
              tableConfig.data[dataIndex].children = children;
              $parentTr.data('childrenLoaded', true).attr('data-children-loaded', true);
              let $nextTr = $parentTr.next('tr');
              $this
                .removeClass('i-table-collapse-close')
                .addClass('i-table-collapse-open');

              const cbi = $parentTr.data('cbIndex');
              const checked = $parentTr.find('.gcb-wrap li').hasClass('checked');
              while ($nextTr.data('level') === level + 1) {
                $nextTr.show();
                
                if (hasCheckBox) {
                  const box = new CheckBox({container: $nextTr.find('.i-table-cell-check-box'), data: { text: '', val: '', checked: checked }, clickCallback: cbClick($nextTr),  parent: cbs[cbi]}).create();
                  cbs.push(box);
                  $nextTr.data('cbIndex', cbs.length - 1);
                }
                $nextTr = $nextTr.next('tr');
              }
            }));
          } else {
            let $nextTr = $parentTr.next('tr');
            $this
              .removeClass('i-table-collapse-close')
              .addClass('i-table-collapse-open');
            while ($nextTr.data('level') === level + 1) {
              $nextTr.show();
              $nextTr = $nextTr.next('tr');
            }
          }
        }
      });

      tableConfig.done && tableConfig.done();
    },
    reload: function(config) {
      if (!active) {
        throw new Error('this table is inactive');
      };
      tableConfig = { ...tableConfig, ...config };
      $elem.html('');
      
      $tableBox
        .append(createHeader(tableConfig.columns, _INDEX_))
        .append(createBody(tableConfig.columns, tableConfig.data, _INDEX_));

      $elem
        .append($tableBox)
        .append(createStyle(tableConfig.columns, _INDEX_));

      $elem.find('.i-table-body').scroll(function() {
        $elem.find('.i-table-header')[0].scrollLeft = this.scrollLeft;
      });

      $elem.find('.i-table-collapse').on('click', function() {
        // open时 为开的状态，那么 -> colse
        // close时 为关的状态，那么 -> open
        const $this = $(this);
        const collapsed = $(this).hasClass('i-table-collapse-open');
        const $parentTr = $this.parents('tr');
        const level = $parentTr.data('level');
        const needLoaded = !$parentTr.data('childrenLoaded');
        if (collapsed) {
          let $nextTr = $parentTr.next('tr');
          // 收缩
          $this
            .removeClass('i-table-collapse-open')
            .addClass('i-table-collapse-close');
          while ($nextTr.data('level') > level) {
            $nextTr.hide();
            $nextTr.find('.i-table-collapse').removeClass('i-table-collapse-open').addClass('i-table-collapse-close');
            $nextTr = $nextTr.next('tr');
          }
        } else {
          if (needLoaded) {
            const dataIndex = $parentTr.data('index');
            (typeof tableConfig.loadChildren === 'function' 
              && 
            tableConfig.loadChildren(tableConfig.data[dataIndex], (children) => {
              $parentTr.after($(createTrs(tableConfig.columns, children, _INDEX_, level + 1)));
              $parentTr.data('childrenLoaded', true).attr('data-children-loaded', true);
              let $nextTr = $parentTr.next('tr');
              $this
                .removeClass('i-table-collapse-close')
                .addClass('i-table-collapse-open');
              while ($nextTr.data('level') === level + 1) {
                $nextTr.show();
                $nextTr = $nextTr.next('tr');
              }
            }));
          } else {
            let $nextTr = $parentTr.next('tr');
            $this
              .removeClass('i-table-collapse-close')
              .addClass('i-table-collapse-open');
            while ($nextTr.data('level') === level + 1) {
              $nextTr.show();
              $nextTr = $nextTr.next('tr');
            }
          }
        }
      });

      tableConfig.done && tableConfig.done();
    },
    getData: function() {
      return tableConfig.data;
    },
    getChecked: function() {
      const $checkedBox = $elem.find('.i-table-body .i-table-cell-check-box .gcb-wrap li.checked');
      const data = [];
      let level = 0;
      while ($checkedBox.parents(`tr[data-level="${level}"]`).length > 0) {
        $.each($checkedBox.parents(`tr[data-level="${level}"]`), (i, tr) => {
          data.push((function getTrData($tr) {
            if ($tr.data('level') === 0) { return tableConfig.data[$tr.data('index')] }
            const $parentTr = $($tr.prevAll(`tr[data-level="${$tr.data('level') - 1}"]`)[0]);
            return getTrData($parentTr).children[$tr.data('index')];
          })($(tr)));
        })
        level += 1;
      }
      return data;
    },
    destroy: function() {
      active = false;
      $elem.html('');
    }
  }
}

function createHeader(columns, index) {
  const $header = $('<div class="i-table-header"></div>');

  const $table = createTable();
  const headStr = '<thead><tr>'
    + columns.reduce(function(str, column, _INDEX_) {
      const isCheckBox = !!column.checkbox;
      const field = column.field ? column.field : _INDEX_;
      return (
        `${str}
        <th class="i-table-cell-${index}-${field}" style="${column.align ? `text-align: ${column.align}` : ''}" data-field="${field}">
          <div class="i-table-cell ${isCheckBox ? 'i-table-cell-check-box' : ''}">
            ${isCheckBox ? '' : `<span>${column.title}</span>`}
          </div>
        </th>`
      );
  }, '') + '</tr></thead>';

  return $header.append($table.html(headStr));
}

function createStyle(columns, index) {
  const $style = $('<style></style>');

  const styleStr = columns.reduce(function(str, column, _INDEX_) {
    var field = column.field ? column.field : _INDEX_;
    var width = column.width ? `width: ${column.width}px;` : '';
    return str + `\n.i-table-cell-${index}-${field} { ${width} }`;
  }, '');

  return $style.html(styleStr);
}

function initCheckBox($elem, cbs, click) {
  const headerTr = $elem.find('.i-table-header tr')[0];
  const hBox = new CheckBox({ container: $(headerTr).find('.i-table-cell-check-box'), data: { text: '', val: '' }, clickCallback: click($(headerTr)) }).create();
  let level = 0;
  cbs.push(hBox);
  $($elem.find('.i-table-header tr')[0]).data('cbIndex', 0);
  while ($elem.find(`tr[data-level="${level}"]`).length) {
    if (level === 0) {
      $.each($elem.find(`tr[data-level="${level}"]`), (k, tr) => {
        const box = new CheckBox({ container: $(tr).find('.i-table-cell-check-box'), data: { text: '', val: '' }, clickCallback: click($(tr)), parent: hBox }).create();
        cbs.push(box);
        $(tr).data('cbIndex', cbs.length - 1);
      });
    } else {
      $.each($elem.find(`tr[data-level="${level}"]`), (k, tr) => {
        const $parentTr = $($(tr).prevAll(`tr[data-level="${level - 1}"]`)[0]);
        const i = $parentTr.data('cbIndex');
        const box = new CheckBox({container: $(tr).find('.i-table-cell-check-box'), data: { text: '', val: '' }, clickCallback: click($(tr)), parent: cbs[i]}).create();
        cbs.push(box);
        $(tr).data('cbIndex', cbs.length - 1);
      });
    }
    level += 1;
  }
}

function getCbClick(tableConfig) {
  const clickCb = tableConfig.columns.filter(column => column.checkbox)[0].click;
  return ($tr) => {
    const isHeaderTr = $tr.parents('.i-table-header').length > 0;
    const data = !isHeaderTr && (function getTrData($tr) {
      if ($tr.data('level') === 0) { return tableConfig.data[$tr.data('index')] }
      const $parentTr = $($tr.prevAll(`tr[data-level="${$tr.data('level') - 1}"]`)[0]);
      return getTrData($parentTr).children[$tr.data('index')];
    })($tr)
    return (status) => {
      if (isHeaderTr) {
        clickCb({ checked: status.checked, type: 'all' });
      } else {
        clickCb({ checked: status.checked, data });
      }
    }
  }
}

module.exports = ITable;