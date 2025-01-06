'use strict';
const Sequelize = require('sequelize');

/**
 * **格式化查询参数适配Sequelize**
 *
 * 查询参数携带转义符（!、<、>、,、~、%）方式部分支持Sequelize查询参数
 *
 * ## 关联
 *
 * - include: 前缀下划线，_include=逗号分隔关联表
 *
 * ## 条件
 *
 * - =: 不包含转义符
 * - !null: 非空，如：gender=!null
 * - >: 前缀大于号，如：price=>99
 * - <: 前缀小于号，如：price=<100
 * - !=: 前缀不等于，如：price=!99
 * - >=: 前缀不小于，如：price=!<100
 * - <=: 前缀不大于，如：price=!>99
 * - in: 逗号分隔，如：name=张三,李四
 * - between: 波浪号分隔，如：date=2023-07-01~2023-08-01
 * - like: 前或后有百分号，如：title=%杭州
 *
 * ## 排序
 *
 * - order by: 前缀下划线，_order
 * - asc: 默认，如：_order=updatedAt
 * - desc: 前缀感叹号，如：_order=!updatedAt
 *
 * ## 分页
 *
 * - offset: 前缀下划线，_offset
 * - limit: 前缀下划线，_limit
 *
 * @param {object} query - 查询参数，一般“引用”ctx.request.query
 * @param {object} config - 配置，如：自定义Sequelize
 * @return {object} Sequelize查询参数
 */
module.exports = (query, config) => {
  config = {
    Sequelize,
    offset: 0,
    limit: 1000,
    reservedKeys: [ 'access_token' ],
    ...config
  };
  const reservedKeys = [
    '_limit',
    '_offset',
    '_include',
    '_order',
    ...config.reservedKeys
  ];
  const { Op } = config.Sequelize;

  // 条件
  const where = {};
  const whereKeys = Object.keys(query).filter(k => !reservedKeys.includes(k));
  whereKeys.forEach(key => {
    // 先从query中删除，再处理
    where[key] = query[key];
    delete query[key];
    // LIKE
    if (where[key].startsWith('%') || where[key].endsWith('%')) {
      where[key] = { [ Op.like ]: where[key] };
      return;
    }
    // IS NOT NULL
    if (where[key] === '!null') {
      where[key] = { [Op.not]: null };
      return;
    }
    // IS NULL
    if (where[key] === 'null') {
      where[key] = { [Op.is]: null };
      return;
    }
    // BETWEEN
    if (where[key].includes('~')) {
      const [ start, end ] = where[key].split('~');
      where[key] = { [ Op.between ]: [ start, end ] };
      return;
    }
    // IN
    if (where[key].includes(',')) {
      where[key] = { [ Op.in ]: where[key].split(',').filter(i => i) };
      return;
    }
    // 大于
    if (where[key].startsWith('>')) {
      where[key] = { [ Op.gt ]: where[key].slice(1) };
      return;
    }
    // 小于
    if (where[key].startsWith('<')) {
      where[key] = { [ Op.lt ]: where[key].slice(1) };
      return;
    }
    // 不大于
    if (where[key].startsWith('!<')) {
      where[key] = { [ Op.gte ]: where[key].slice(2) };
      return;
    }
    // 不小于
    if (where[key].startsWith('!>')) {
      where[key] = { [ Op.lte ]: where[key].slice(2) };
      return;
    }
    // 不等于
    if (where[key].startsWith('!')) {
      where[key] = { [ Op.ne ]: where[key].slice(1) };
      return;
    }
  });
  query.where = where;

  // 关联
  if (query._include) {
    query.include = query._include.split(',');
  }

  // 排序
  if (query._order) {
    query.order = [];
    const orders = query._order.split(',');
    orders.forEach(order => {
      if (order.startsWith('!')) {
        query.order.push([ order.slice(1), 'desc' ]);
      } else {
        query.order.push([ order, 'asc' ]);
      }
    });
  }

  // 分页
  const offset = parseInt(query._offset);
  query.offset = isNaN(offset) ? config.offset : offset;
  query.limit = parseInt(query._limit) || config.limit;

  // 清理
  delete query._include;
  delete query._order;
  delete query._limit;
  delete query._offset;
  return query;
};
