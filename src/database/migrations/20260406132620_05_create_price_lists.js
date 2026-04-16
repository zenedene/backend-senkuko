exports.up = function (knex) {
  return knex.schema.createTable('price_lists', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('code').notNullable().unique();
    table.string('description').nullable();
    table.boolean('is_active').defaultTo(true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('price_lists');
};