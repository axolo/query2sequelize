# query2sequelize

Parse query as [Sequelize].

## install

```shell
npm i @axolo/query2sequelize
```

## usage

```js
const query2sequelize = require('@axolo/query2sequelize')

const result = query2sequelize({
  price: '>99',
  name: 'John,Doe',
  title: '%Sample%',
  access_token: 'secret',
  additionalField: 'value',
  _include: 'users,orders',
  _order: 'createdAt,!updatedAt',
  _offset: 10,
  _limit: 20
})
```

> result

```js
{
  access_token: 'secret',
  include: ['users', 'orders'],
  where: {
    price: { [Sequelize.Op.gt]: '99' },
    name: { [Sequelize.Op.in]: ['John', 'Doe'] },
    title: { [Sequelize.Op.like]: '%Sample%' },
    additionalField: 'value'
  },
  order: [
    ['createdAt', 'asc'],
    ['updatedAt', 'desc']
  ],
  offset: 10,
  limit: 20
}
```

## api

```js
query2sequelize(query, [config])
```

### query

#### include

|   params   |        sql        |         example          |      description       |
| :--------: | :---------------: | ------------------------ | ---------------------- |
| `_include` | `LEFT OUTER JOIN` | `_include=user,newsTags` | join user and newsTags |

> news hasOne user, hasMany tags

```sql
-- curl '/news?_include=user,tags'
SELECT * FROM news
LEFT OUTER JOIN `user` ON `user`.id = news.userId
LEFT OUTER JOIN newsTag ON newsTag.newsId = news.id;
```

#### where

| params |      sql      |           example            |         description          |
| :----: | :-----------: | ---------------------------- | ---------------------------- |
|        |      `=`      | `price=99`                   | price = 99                   |
|  `>`   |      `>`      | `price=>99`                  | price > 99                   |
|  `<`   |      `<`      | `price=<100`                 | price < 100                  |
|  `!`   |     `!=`      | `price=!99`                  | price != 99                  |
|  `!<`  |     `>=`      | `price=!<100`                | price >= 100                 |
|  `!>`  |     `<=`      | `price=!>99`                 | price <= 100                 |
|  `%`   |    `LIKE`     | `title=Hangzhou%`            | starts with 'Hangzhou'       |
|  `,`   |     `IN`      | `name=zhangsan,lisi`         | name in ['zhangsan', 'lisi'] |
|  `~`   | `BETWEEN AND` | `date=2023-07-01~2023-08-01` | date in july of 2023         |

> news of October 2024

```sql
-- curl '/news?createdAt=2024-10-01~2024-11-01'
SELECT * FROM news
WHERE createdAt BETWEEN '2024-10-01' AND '2024-11-01';
```

#### order

|  params  |    sql     |         example          |       description        |
| :------: | :--------: | ------------------------ | ------------------------ |
| `_order` | `ORDER BY` | `_order=updatedAt`       | order by updatedAt asc   |
|   `!`    |   `DESC`   | `_order=!updatedAt`      | order by updatedAt desc  |
|   `,`    |    `,`     | `_order=sort,!updatedAt` | sort asc, updatedAt desc |

> get news with top and updatedAt desc

```sql
-- curl '/news?_order=top,!updatedAt'
SELECT * FROM news
ORDER BY `top` ASC, updatedAt DESC;
```

#### limit

|  params   |   sql   |   example    |     description      |
| :-------: | :-----: | ------------ | -------------------- |
| `_offset` | `LIMIT` | `_offset=10` | record start from 10 |
| `_limit`  | `LIMIT` | `_limit=20`  | limit 20 records     |

> news of page 2

```sql
-- curl '/news?_offset=10&_limit=20'
SELECT * FROM news
LIMIT 10, 20;
```

### config

|     params     |   type   |      default       |    description     |
| -------------- | -------- | ------------------ | ------------------ |
| `Sequelize`    | `Object` | `config.Sequelize` | Sequelize instance |
| `offset`       | `Number` | `0`                | default offset     |
| `limit`        | `Number` | `100`              | default limit      |
| `reservedKeys` | `Array`  | `['access_token']` | disable where keys |

> Yueming Fang
> 2024-12-05

[Sequelize]: https://sequelize.org/
