exports.up = function (knex) {
  return knex.schema.createTable('stock_ledger', (table) => {
    table.uuid('id').primary();
    table.uuid('product_variant_id').notNullable();
    table.uuid('reference_id').nullable();
    table.string('reference_type').nullable();
    table.integer('qty_change').notNullable();
    table.integer('qty_before').notNullable();
    table.integer('qty_after').notNullable();
    table.string('note').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('product_variant_id').references('id').inTable('product_variants').onDelete('RESTRICT');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('stock_ledger');
};