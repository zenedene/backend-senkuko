exports.up = function (knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.string('midtrans_order_id').nullable().unique();
    table.text('midtrans_token').nullable();
    table.text('midtrans_pdf_url').nullable();
    table.string('payment_status').defaultTo('pending');
    table.timestamp('paid_at').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('midtrans_order_id');
    table.dropColumn('midtrans_token');
    table.dropColumn('midtrans_pdf_url');
    table.dropColumn('payment_status');
    table.dropColumn('paid_at');
  });
};