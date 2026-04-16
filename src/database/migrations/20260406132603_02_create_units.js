exports.up = function (knex) {
  return knex.schema.createTable('units', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('symbol').notNullable();
    table.string('description').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('units');
};