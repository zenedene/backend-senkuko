export const up = function (knex) {
  return knex.schema.alterTable('product_variants', (table) => {
    table.integer('crisis_stock').defaultTo(0);
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('product_variants', (table) => {
    table.dropColumn('crisis_stock');
  });
};
