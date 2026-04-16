require('dotenv').config({ path: './src/.env' });

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'sankuko',
  authPlugins: {
    mysql_native_password: () => () => Buffer.from(''),
  },
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },
};