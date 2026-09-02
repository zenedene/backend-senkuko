exports.up = function (knex) {
  return knex.schema.alterTable("vouchers", (table) => {
    table.string("visibility").notNullable().defaultTo("public");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("vouchers", (table) => {
    table.dropColumn("visibility");
  });
};