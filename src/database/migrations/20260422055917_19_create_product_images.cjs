exports.up = function (knex) {
  return knex.schema.createTable("product_images", (table) => {
    table.uuid("id").primary();
    table.uuid("product_id").notNullable();
    table.string("image_url");
    table.string("public_id"); // penting untuk delete
    table.boolean("is_primary").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("product_images");
};

