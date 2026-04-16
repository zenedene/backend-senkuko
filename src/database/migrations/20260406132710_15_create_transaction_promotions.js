exports.up = function (knex) {
  return knex.schema.createTable('transaction_promotions', (table) => {
    table.uuid('id').primary();
    table.uuid('transaction_id').notNullable();
    table.uuid('promotion_id').notNullable();
    table.uuid('voucher_id').nullable();
    table.decimal('discount_given', 15, 2).defaultTo(0);
    table.text('applied_rewards').nullable();

    table.foreign('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
    table.foreign('promotion_id').references('id').inTable('promotions').onDelete('RESTRICT');
    table.foreign('voucher_id').references('id').inTable('vouchers').onDelete('SET NULL');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('transaction_promotions');
};