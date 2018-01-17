import $ from 'jquery';

import './index.less';

let PAGE_INDEX = 0;

const DEFAULT_CONFIG = {
  curr: 1,
  size: 10,
  limits: [10, 20, 30, 50, 100]
};

const getPagerIndex = () => {
  PAGE_INDEX += 1;
  return PAGE_INDEX;
};

class Pager {
  constructor(elem) {

    this.$elem = $(elem);
    this._INDEX_ = getPagerIndex();

  }

  CONFIG = DEFAULT_CONFIG

  render = (config) => {

    this.$elem.html('');
    
    this.CONFIG = { ...this.CONFIG, ...config };

    const $pageBox = $(`<div class="i-box i-pager" id="i-pager-${this._INDEX_}"></div>`);

    $pageBox
      .append(this.createPagerChoose())
      .append(this.createPagerLimits())
      .append(this.createPagerCount());
    
    this.$elem.append($pageBox);

    const self = this;
    $(`#i-pager-${this._INDEX_} .i-pager-choose a`).on('click', function() {
      if ($(this).hasClass('i-disabled')) return false;
      const curr = $(this).data('page');
      const { size, count } = self.CONFIG;
      self.CONFIG.onChange({ curr, size, count });
      self.render({ curr });
    });

    $(`#i-pager-${this._INDEX_} .i-pager-limits-choose li`).on('click', function() {
      if ($(this).hasClass('active')) return false;
      const size = $(this).data('limit');
      const { curr, count } = self.CONFIG;

      $(`#i-pager-${self._INDEX_} .i-pager-limits-choose`).hide();

      setTimeout(() => {
        $(`#i-pager-${self._INDEX_} .i-pager-limits-choose`).css('display', '');
      }, 100);

      self.CONFIG.onChange({ curr: Math.min(curr, Math.ceil(count / size)), size, count });
      self.render({ size });
    });
  }

  getStatus = () => {
    const { curr, size, count } = this.CONFIG;
    return { curr, size, count };
  }

  /** 下面开始是内部使用的方法 */
  createPagerChoose = () => {
    const sprStr = '<span class="i-pager-spr">…</span>';

    const { size, count } = this.CONFIG;

    const pageCount = Math.ceil(count / size);

    this.CONFIG.curr = Math.min(pageCount, this.CONFIG.curr);

    const { curr } = this.CONFIG;

    const $wrap = $('<div class="i-pager-choose"></div>');

    const $prev = $(`<a href="javascript:;" class="i-pager-prev ${curr - 1 <= 0 ? 'i-disabled' : ''}" data-page="${curr - 1}"><i class="i-icon"></i></a>`);
    const $next = $(`<a href="javascript:;" class="i-pager-next ${curr + 1 > pageCount ? 'i-disabled' : ''}" data-page="${curr + 1}"><i class="i-icon"></i></a>`);

    const $curr = $(`<span class="i-pager-curr"><em class="i-pager-em"></em><em>${curr}</em></span>`);

    let prevCurrStr = '';
    const pervShowNum = Math.min(curr - 1, 2);
    for (let i = 1; i <= pervShowNum; i ++ ) {
      prevCurrStr = `<a href="javascript:;" data-page="${curr - i}">${curr - i}</a>${prevCurrStr}`
      if (i === 2 && curr - 1 > 2) {
        if (curr - 1 > 3) prevCurrStr = `${sprStr}${prevCurrStr}`;
        prevCurrStr = `<a href="javascript:;" data-page="1">1</a>${prevCurrStr}`;
      }
    }

    let nextCurrStr = '';
    const nextShowNum = Math.min(pageCount - curr, 2);
    for (let i = 1; i <= nextShowNum; i ++) {
      nextCurrStr += `<a href="javascript:;" data-page="${curr + i}">${curr + i}</a>`;
      if (i === 2 && pageCount - curr > 2) { 
        if (pageCount - curr > 3) nextCurrStr += sprStr;
        nextCurrStr += `<a href="javascript:;" data-page="${pageCount}">${pageCount}</a>`;
      };
    }

    $wrap
      .append($prev)
      .append($(prevCurrStr))
      .append($curr)
      .append($(nextCurrStr))
      .append($next);

    return $wrap;
  }

  createPagerCount = () => {
    return $(`<div class="i-pager-count">共 ${this.CONFIG.count} 条</div>`);
  }

  createPagerLimits = () => {
    const { limits, size } = this.CONFIG;
 
    const $wrap = $('<div class="i-pager-limits"></div>');
    const showStr = `<div class="i-pager-limits-show">${size} 条／页<i></i></div>`
    const limitStr = `<ul class="i-pager-limits-choose">${limits.reduce((str, item) => `${str}<li data-limit="${item}" class="${item === size ? 'active': ''}">${item} 条／页</li>`, '')}</ul>`;
    $wrap
      .append($(showStr).append($(limitStr)));
      // .append($(limitStr));
    return $wrap;
  }

  /** 内部方法结束 */
}

module.exports = Pager;
