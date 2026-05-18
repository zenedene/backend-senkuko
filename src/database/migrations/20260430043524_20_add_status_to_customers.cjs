exports.up = function (knex) {
  return knex.schema.alterTable('customers', (table) => {
    table.string('status').defaultTo('active').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('customers', (table) => {
    table.dropColumn('status');
  });
};