import 'dotenv/config';

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'sankuko',
  authPlugins: {                          // ← tambahkan ini
    mysql_native_password: () => () => Buffer.from(process.env.DB_PASSWORD + '\0')
  }
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