export const up = function (knex) {
  return knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary();
    table.string('invoice_number').notNullable().unique();
    table.uuid('customer_id').nullable();
    table.uuid('cashier_id').notNullable();
    table.string('status').defaultTo('pending');
    table.decimal('subtotal', 15, 2).defaultTo(0);
    table.decimal('total_discount', 15, 2).defaultTo(0);
    table.decimal('grand_total', 15, 2).defaultTo(0);
    table.decimal('paid_amount', 15, 2).defaultTo(0);
    table.decimal('change_amount', 15, 2).defaultTo(0);
    table.string('payment_method').nullable();
    table.timestamp('transacted_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.foreign('customer_id').references('id').inTable('customers').onDelete('SET NULL');
  });
};
export const down = function (knex) {
  return knex.schema.dropTableIfExists('transactions');
};