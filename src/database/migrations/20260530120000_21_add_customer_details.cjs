exports.up = function (knex) {
  return knex.schema.alterTable("customers", (table) => {
    table.string("code").unique().nullable();
    table.string("address").nullable();
    table.string("city").nullable();
    table.string("region").nullable();
    table.string("subregion").nullable();
    table.string("customer_group").defaultTo("General").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("customers", (table) => {
    table.dropColumn("code");
    table.dropColumn("address");
    table.dropColumn("city");
    table.dropColumn("region");
    table.dropColumn("subregion");
    table.dropColumn("customer_group");
  });
};
