exports.up = function (knex) {
  return knex.schema.createTable("banners", (table) => {
    table.uuid("id").primary();
    table.string("image_url").notNullable();
    table.string("public_id");
    table.string("title");
    table.integer("sort_order").defaultTo(0);
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("banners");
};
