import $ from 'jquery';

import createTable from './createTable';

function createBody(columns, data, _INDEX_) {
  const $body = $('<div class="i-table-body"></div>');
  const $table = createTable();

  const bodyStr = `<tbody>${createTrs(columns, data, _INDEX_, 0)}</tbody>`;

  return $body.append($table.html(bodyStr));
}

export function createTrs(columns, data, _INDEX_, level) {
  return data.reduce((res, item, index) => {
    return res + createTr(columns, item, _INDEX_, index, level);
  }, '');
}

function createTr(columns, item, _INDEX_, index, level) {
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
    ${hasChildren && !needLoadChild ? createTrs(columns, item.children, _INDEX_, ++level) : ''}
    `
  );
}

export default createBody;

