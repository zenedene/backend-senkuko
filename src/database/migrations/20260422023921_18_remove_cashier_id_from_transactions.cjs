exports.up = function (knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('cashier_id');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.uuid('cashier_id').nullable();
  });
};