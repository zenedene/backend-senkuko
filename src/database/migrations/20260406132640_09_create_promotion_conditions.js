export const up = function (knex) {
  return knex.schema.createTable('promotion_conditions', (table) => {
    table.uuid('id').primary();
    table.uuid('promotion_id').notNullable();
    table.string('condition_type').notNullable();
    table.string('operator').notNullable();
    table.text('value').notNullable();
    table.string('target_type').nullable();
    table.uuid('target_id').nullable();
    table.foreign('promotion_id').references('id').inTable('promotions').onDelete('CASCADE');
  });
};
export const down = function (knex) {
  return knex.schema.dropTableIfExists('promotion_conditions');
};