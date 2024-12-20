const formatQuery = require('../src/index');
const Sequelize = require('sequelize');

describe('formatQuery function', () => {
  test('full', () => {
    const query = {
      price: '>99',
      name: 'Da,Fang',
      title: '%Sample%',
      access_token: 'secret',
      additionalField: 'value',
      _include: 'users,orders',
      _order: 'createdAt,!updatedAt'
    };
    const config = { Sequelize };
    const result = formatQuery(query, config);
    expect(result).not.toHaveProperty('additionalField');
    expect(result).toEqual({
      access_token: 'secret',
      include: ['users', 'orders'],
      where: {
        price: { [Sequelize.Op.gt]: '99' },
        name: { [Sequelize.Op.in]: ['Da', 'Fang'] },
        title: { [Sequelize.Op.like]: '%Sample%' },
        additionalField: 'value'
      },
      order: [
        ['createdAt', 'asc'],
        ['updatedAt', 'desc']
      ],
      offset: 0,
      limit: 1000
    });
  });

  test('include', () => {
    const query = {
      _include: 'users,orders'
    };
    const config = { Sequelize };
    const result = formatQuery(query, config);
    expect(result.include).toEqual(['users', 'orders']);
  });

  test('order', () => {
    const query = {
      _order: 'createdAt,!updatedAt'
    };
    const config = { Sequelize };
    const result = formatQuery(query, config);
    expect(result.order).toEqual([
      ['createdAt', 'asc'],
      ['updatedAt', 'desc']
    ]);
  });

  test('limit', () => {
    const query = {
      _offset: '10',
      _limit: '20'
    };
    const config = { Sequelize };
    const result = formatQuery(query, config);
    expect(result.offset).toEqual(10);
    expect(result.limit).toEqual(20);
  });

  test('where', () => {
    const query = {
      price: '>99',
      date: '2023-01-01~2023-12-31',
      status: '!active'
    };
    const config = { Sequelize };
    const result = formatQuery(query, config);
    expect(result.where).toEqual({
      price: { [Sequelize.Op.gt]: '99' },
      date: { [Sequelize.Op.between]: ['2023-01-01', '2023-12-31'] },
      status: { [Sequelize.Op.ne]: 'active' }
    });
  });

  test('reserved', () => {
    const query = {
      _limit: '50',
      _offset: '0',
      _include: 'comments',
      _order: 'date',
      access_token: 'secret',
      additionalField: 'value'
    };
    const config = { Sequelize, offset: 10, limit: 20 };
    const result = formatQuery(query, config);
    expect(result).not.toHaveProperty('additionalField');
    expect(result.offset).toEqual(0); // Should use query._offset
    expect(result.limit).toEqual(50);  // Should use query._limit
  });
});
