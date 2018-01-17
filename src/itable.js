import $ from 'jquery';

import Pager from './pager';
import CheckBox from './CheckBox';

import createTable from './createTable';
import './index.less';

let TABLE_INDEX = 0;

const DEFAULT_CONFIG = {
  sortStatus: {}
};

const getTableIndex = () => {
  TABLE_INDEX += 1;
  return TABLE_INDEX;
};

class ITable {
  constructor(elem) {
    this.$elem = $(elem).addClass('i-table');
    this._INDEX_ = getTableIndex();
  }

  active = true

  CONFIG = DEFAULT_CONFIG

  // checkboxs
  cbs = []

  render = (config = {}) => {
    if (!this.active) {
      throw new Error('这个table已经被销毁了。');
    }
    this.$elem.html('');
    
    this.CONFIG = { ...this.CONFIG, ...config };

    this.main();
  }

  destroy = () => {
    this.active = false;
    this.$elem.html('');
  }

  getChecked = () => {
    const { $elem } = this;
    const $checkedBox = $elem.find('.i-table-body .i-table-cell-check-box .gcb-wrap li.checked');
    const data = [];
    $.each($checkedBox.parents('tr'), (i, tr) => {
      (typeof $(tr).data('level') !== 'undefined'
        &&
      data.push(this.getTrData($(tr))));
    });
    return data;
  }

  getData = () => {
    return this.CONFIG.data;
  }

  getStatus = () => {
    const pagerStatus = this.pager.getStatus();
    const sortStatus = this.getSortStatus();

    return { pager: pagerStatus, sort: sortStatus };
  }

  /** 下面开始是内部使用的方法 */
  main = () => {
    const $tableBox = $('<div class="i-table-box"></div>');
    
    $tableBox
      .append(this.createHeader())
      .append(this.createBody());

    this.$elem
      .append($tableBox)
      .append(this.createStyle());

    if (this.CONFIG.pager) this.createPager();
    
    const self = this;

    // checkbox 相关
    const hasCheckBox = this.$elem.find('.i-table-cell-check-box').length > 0;
    const clickFactory = hasCheckBox && this.getCbClickFactory();
    hasCheckBox && this.initCheckBox(clickFactory);
    
    // 滚动相关
    this.$elem.find('.i-table-body').scroll(function() {
      self.$elem.find('.i-table-header')[0].scrollLeft = this.scrollLeft;
    });

    // 收缩相关
    this.$elem.find('.i-table-collapse').on('click', function() {
      const { CONFIG, cbs } = self;
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
          $nextTr.find('.i-table-collapse')
            .removeClass('i-table-collapse-open')
            .addClass('i-table-collapse-close');
          $nextTr = $nextTr.next('tr');
        }
      } else {
        // 展开
        if (needLoaded) {
          const dataIndex = $parentTr.data('index');
          (typeof CONFIG.loadChildren === 'function' 
            && 
            CONFIG.loadChildren(self.getTrData($parentTr), (children) => {
            $parentTr.after($(self.createTrs(children, level + 1)));
            // CONFIG.data[dataIndex].children = children;
            self.setTrChildren($parentTr, children);
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
                const box = new CheckBox({container: $nextTr.find('.i-table-cell-check-box'), data: { text: '', val: '', checked: checked }, clickCallback: clickFactory($nextTr),  parent: cbs[cbi]}).create();
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

    // sort 相关
    this.$elem.find('.i-table-header .i-sort-wrap i').on('click', function() {
      // console.log($(this).data('sort'));
      const $this = $(this);
      const field = $this.parents('th').data('field');
      const sort = $this.data('sort');
      if ($this.hasClass('active')) {
        $this.removeClass('active');
        self.CONFIG.sortStatus = { ...self.CONFIG.sortStatus, [field]: undefined };
      } else {
        $this.siblings('i').removeClass('active');
        $this.addClass('active');
        self.CONFIG.sortStatus = { ...self.CONFIG.sortStatus, [field]: sort };
      }
      typeof self.CONFIG.onChange === 'function' && self.CONFIG.onChange(self.getStatus());
    });

    this.CONFIG.done && this.CONFIG.done();
  }

  createHeader = () => {
    const { columns, sortStatus = {} } = this.CONFIG;
    const { _INDEX_ } = this;
    const $header = $('<div class="i-table-header"></div>');
    const $table = createTable();

    const headStr = '<thead><tr>'
      + columns.reduce(function(str, column, i) {
        const isCheckBox = !!column.checkbox;
        const field = column.field ? column.field : i;
        const sort = !!column.sort;
        return (
          `${str}
          <th class="i-table-cell-${_INDEX_}-${field}" style="${column.align ? `text-align: ${column.align}` : ''}" data-field="${field}">
            <div class="i-table-cell ${isCheckBox ? 'i-table-cell-check-box' : ''}">
              ${isCheckBox ? '' : `<span>${column.title}</span>`}
              ${sort ? `<span class="i-sort-wrap"><i class="i-asc-icon ${sortStatus[field] === 'asc' ? 'active': ''}" data-sort="asc"></i><i class="i-desc-icon ${sortStatus[field] === 'desc' ? 'active': ''}" data-sort="desc"></i></span>`: ''}
            </div>
          </th>`
        );
    }, '') + '</tr></thead>';

    return $header.append($table.html(headStr));
  }

  createBody = () => {
    const { _INDEX_ } = this;
    const { columns, data } = this.CONFIG;
    const $body = $('<div class="i-table-body"></div>');
    const $table = createTable();
  
    const bodyStr = `<tbody>${this.createTrs(data, 0)}</tbody>`;
  
    return $body.append($table.html(bodyStr));
  }

  createTrs = (data, level) => {
    const { columns } = this.CONFIG;
    return data.reduce((res, item, index) => {
      return res + this.createTr(item, index, level);
    }, '');
  }

  createTr(item, index, level) {
    const { _INDEX_ } = this;
    const { columns } = this.CONFIG;

    const hasChildren = !!item.children;
    const needLoadChild = typeof item.children === 'boolean' && hasChildren;
    return (
      `<tr data-index="${index}" class="i-table-level-${level}" data-level="${level}" ${needLoadChild ? 'data-children-loaded="false"' : 'data-children-loaded="true"'} style="${level !== 0 ? 'display: none;' : ''}">
        ${columns.reduce((str, column, j) => {
          const isCheckBox = !!column.checkbox;
          const field = column.field ? column.field : j;
          let content;
          if (column.render && typeof column.render === 'function') {
            content = column.render(item[column.field] || item, item, j);
          } else {
            content = item[column.field];
          }
          str += (
            `<td class="i-table-cell-${_INDEX_}-${field}" style="${column.align ? `text-align: ${column.align}` : ''}" data-field="${field}">
              <div class="i-table-cell ${isCheckBox ? 'i-table-cell-check-box' : ''}">
                ${hasChildren && column.collapse ? '<i class="i-table-collapse i-table-collapse-close" style="position: absolute; left: 0;">+</i>' : ''}
                ${isCheckBox ? '' : `${content}`}
              </div>
            </td>`
          );
          return str;
        }, '')}
      </tr>
      ${hasChildren && !needLoadChild ? this.createTrs(item.children, ++level) : ''}
      `
    );
  }

  createStyle = () => {
    const { columns } = this.CONFIG;
    const { _INDEX_ } = this;
    const $style = $('<style></style>');

    const styleStr = columns.reduce(function(str, column, i) {
      var field = column.field ? column.field : i;
      var width = column.width ? `width: ${column.width}px;` : '';
      return str + `\n.i-table-cell-${_INDEX_}-${field} { ${width} }`;
    }, '');

    return $style.html(styleStr);
  }

  initCheckBox = (clickFactory) => {
    const { $elem, cbs } = this;
    const headerTr = $elem.find('.i-table-header tr')[0];
    const hBox = new CheckBox({ container: $(headerTr).find('.i-table-cell-check-box'), data: { text: '', val: '' }, clickCallback: clickFactory($(headerTr)) }).create();
    let level = 0;
    cbs.push(hBox);
    $($elem.find('.i-table-header tr')[0]).data('cbIndex', 0);
    while ($elem.find(`tr[data-level="${level}"]`).length) {
      if (level === 0) {
        $.each($elem.find(`tr[data-level="${level}"]`), (k, tr) => {
          const box = new CheckBox({ container: $(tr).find('.i-table-cell-check-box'), data: { text: '', val: '' }, clickCallback: clickFactory($(tr)), parent: hBox }).create();
          cbs.push(box);
          $(tr).data('cbIndex', cbs.length - 1);
        });
      } else {
        $.each($elem.find(`tr[data-level="${level}"]`), (k, tr) => {
          const $parentTr = $($(tr).prevAll(`tr[data-level="${level - 1}"]`)[0]);
          const i = $parentTr.data('cbIndex');
          const box = new CheckBox({container: $(tr).find('.i-table-cell-check-box'), data: { text: '', val: '' }, clickCallback: clickFactory($(tr)), parent: cbs[i]}).create();
          cbs.push(box);
          $(tr).data('cbIndex', cbs.length - 1);
        });
      }
      level += 1;
    }
  }

  getCbClickFactory = () => {
    const { CONFIG } = this;
    const click = CONFIG.columns.filter(column => column.checkbox)[0].click;
    return ($tr) => {
      const isHeaderTr = $tr.parents('.i-table-header').length > 0;
      const data = !isHeaderTr && this.getTrData($tr);
      return (status) => {
        if (isHeaderTr) {
          click({ checked: status.checked, type: 'all' });
        } else {
          click({ checked: status.checked, data });
        }
      }
    }
  }

  getTrData = ($tr) => {
    const { data } = this.CONFIG; 
    if ($tr.data('level') === 0) { return data[$tr.data('index')] }
    const $parentTr = $($tr.prevAll(`tr[data-level="${$tr.data('level') - 1}"]`)[0]);
    return this.getTrData($parentTr).children[$tr.data('index')];
  }

  setTrChildren = ($tr, children) => {
    this.getTrData($tr).children = children;
  }

  createPager = () => {
    this.$elem.append(`<div class="i-pager-box" id="i-table-pager-${this._INDEX_}"></div>`);
    this.onPagerChange = (pagerStatus) => {
      const sort = this.getSortStatus();
      this.CONFIG.onChange({ pager: pagerStatus, sort });
    }
    this.pager = new Pager(`#i-table-pager-${this._INDEX_}`);
    this.pager.render({ ...this.CONFIG.pager, onChange: this.onPagerChange });
  }

  getSortStatus = () => {
    const { sortStatus = {} } = this.CONFIG;
    return { ...sortStatus };
  }
  /** 内部方法结束 */
}

class ITableWrap {
  constructor(elem) {
    const table = new ITable(elem);
    const { render, reload, destroy, getChecked, getData, getStatus } = table;

    this.render = render;
    this.destroy = destroy;
    this.getChecked = getChecked;
    this.getData = getData;
    this.getStatus = getStatus;
  }
}

module.exports = ITableWrap;
