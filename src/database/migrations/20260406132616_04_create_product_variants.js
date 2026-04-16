exports.up = function (knex) {
  return knex.schema.createTable('product_variants', (table) => {
    table.uuid('id').primary();
    table.uuid('product_id').notNullable();
    table.uuid('unit_id').notNullable();
    table.string('name').notNullable();
    table.string('barcode').nullable();
    table.integer('stock_qty').defaultTo(0);
    table.integer('min_stock_qty').defaultTo(0);
    table.decimal('conversion_factor', 10, 4).defaultTo(1);
    table.boolean('is_base_unit').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.foreign('unit_id').references('id').inTable('units').onDelete('RESTRICT');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('product_variants');
};