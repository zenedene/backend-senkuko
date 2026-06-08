exports.up = function (knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.string('delivery_address').nullable();
    table.string('delivery_city').nullable();
    table.string('delivery_region').nullable();
    table.string('delivery_subregion').nullable();
    table.string('delivery_note').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('delivery_address');
    table.dropColumn('delivery_city');
    table.dropColumn('delivery_region');
    table.dropColumn('delivery_subregion');
    table.dropColumn('delivery_note');
  });
};