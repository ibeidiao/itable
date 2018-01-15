/**
 * 针对于表格类的全选框的实现。
 * 一次性生成一个多选框。
 * @author xylin
 */

import $ from 'jquery';

// 观察者对象
var Observer = (function(){

  var __message = {};

  return {
    // 注册信息
    regist: function(type, fn){
      if(typeof __message[type] === 'undefined') {
        __message[type] = [fn];
      } else {
        __message[type].push(fn);
      }
      return this;
    },
    // 发布信息
    fire: function(type, args){
      if(!__message[type]) {
        return this;
      }
      var event = {
        type: type,
        args: args || {}
      },
      i = 0,
      len = __message[type].length;

      for(; i < len; i ++) {
        __message[type][i].call(this, event);
      }
      return this;
    },
    // 移除信息
    remove: function(type, fn){
      if(__message[type] instanceof Array) {
        var i = __message[type].length - 1;
        for(; i>= 0; i --) {
          __message[type][i] === fn && __message[type].splice(i, 1);
        } 
      }
      return this;
    }
  }

})();

let index = 1;

/**
 * 
 * @param {*} options 包含初始化的配置。
 */
const CheckBox = function(options) {
  this._childNum = 0;
  this._checkedChild = [];

  this.uniquecClass = `gcb-${index++}-${new Date().getTime()}`;
  this.selector = `.${this.uniquecClass}`;

  if (!options.data) {
    throw new Error('CheckBox中options的data必须存在。');
  }
  this.options = {
    data: options.data,
    container: options.container || $('body'),
    parent: options.parent,
    disabled: options.disabled,
    clickCallback: options.clickCallback || $.noop
  }

  const that = this;
  this.click = function() {

    const checked = !that.options.data.checked;

    that.check(checked);

    that.options.clickCallback && that.options.clickCallback(that.options.data, that.uniquecClass);

    return false;
  }

}

CheckBox.prototype = {
  constructor: CheckBox,
  /**
   * 创建cbox
   */
  create: function(){

    var that = this,
      options = that.options,
      data = options.data,
      container = options.container,
      htmlStr = 
        `<div class="gcb-wrap ${that.uniquecClass}" >
        <ul><li data-val="${data.val}" class="${data.checked ? 'checked' : ''} ${data.disabled ? 'disabled' : ''}" >${data.text}</li></ul>
        </div>`;
    
    container.html(htmlStr);

    if (options.parent) {
      if (!(options.parent instanceof CheckBox)) {
        throw new Error('parent属性必须为CheckBox类型');
      }
      options.parent._child(that);
      that._parent(options.parent);
    } 

    if (!options.disabled) {
      $(that.selector).on('click', that.click);
    }

    return this;

  },
  /**
   * @return {boolean} 是否失效
   */
  isDisabled: function() {
    return !!this.options.disabled;
  },
  /**
   * 让cbox点击失效
   */
  disabled: function() {

    this.options.disabled = true;

    $(this.selector).find('li').addClass('disabled');
    $(this.selector).unbind('click');

    return this;
  },
  /**
   * 让cbox点击生效
   */
  enabled: function() {
    
    this.options.disabled = false;

    $(this.selector).find('li').removeClass('disabled');
    $(this.selector).unbind('click').on('click', this.click);

    return this;
  },
  /**
   * 返回cbox是否被选中布尔值
   * 
   * @return {boolean} 是否被选中
   */
  isChecked: function() {
    return !!this.options.data.checked;
  },
  /**
   * 返回cbox是否没有被选中布尔值
   * 
   * @return {boolean} 是否没被选中
   */
  isUnChecked: function() {
    return !this.isChecked();
  },
  /**
   * 改变cbox的选中状态，并判断是否向父／子box发送消息
   * 
   * @param {boolean} checked 是否被选中
   * @param {boolean} noFire 是否发送消息
   */
  check: function(checked, noFire) {

    var $li = $(this.selector).find('li');

    this.options.data.checked = checked;

    if(!noFire) {
      // 发布自身的状态信息。 parent／child 都发布。
      Observer
        .fire(`child-${this.uniquecClass}-check`, { checked: checked }) // 向父box发送点击事件消息
        .fire(`parent-${this.uniquecClass}-check`, { checked: checked });  // 向子box发送点击事件消息
    }

    checked ? $li.addClass('checked') : $li.removeClass('checked');

    return this;

  },
  /**
   * 内部方法。父box注册子box的改变的消息。
   * 
   * @param {CheckBox} cbox 子box
   */
  _child: function(cbox) {

    // that 是 父box ／ cbox 是子box
    var that = this;
    that._childNum ++;

    if( cbox.options.data.checked ) {
      that._checkedChild.push(`${cbox.uniquecClass}-check`);
      (that._childNum == that._checkedChild.length) ? that.check(true) : '';
    }

    // 注册（订阅）子box的check事件。
    Observer.regist(`child-${cbox.uniquecClass}-check`, function(e) {
      // 收到子box的点击事件后调用的函数。

      var childId = e.type.split('-').slice(1).join('-');

      if(e.args.checked) {
        that._checkedChild.indexOf(childId) > -1 ? '' : that._checkedChild.push(childId);
      } else {
        that._checkedChild.indexOf(childId) > -1 ? that._checkedChild.splice(that._checkedChild.indexOf(childId), 1) : '';
      }

      var checked = (that._checkedChild.length == that._childNum);

      that.check(checked, true);

      // 向 父box 发送点击事件消息
      Observer.fire(`child-${that.uniquecClass}-check`, {checked: checked});

    });

  },
  /**
   * 内部方法。子box注册父box的改变的消息。
   * 
   * @param {CheckBox} cbox 父box
   */
  _parent: function(cbox) {
    // cbox 是父box ／ that 是子box

    var that = this;

    // 注册(订阅)父box的check事件
    Observer.regist(`parent-${cbox.uniquecClass}-check`, function(e) {
      // 收到父box的点击事件后调用的函数。

      var childId = `${that.uniquecClass}-check`;

      if(e.args.checked) {
        cbox._checkedChild.indexOf(childId) > -1 ? '' : cbox._checkedChild.push(childId);
      } else {
        cbox._checkedChild.indexOf(childId) > -1 ? cbox._checkedChild.splice(cbox._checkedChild.indexOf(childId), 1) : '';
      }

      that.check(e.args.checked, true);

      // 向 子box 发送点击事件消息
      Observer.fire(`parent-${that.uniquecClass}-check`, {checked: e.args.checked});

    });

  }
}

module.exports = CheckBox;