const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

exports.up = async function (knex) {
  const admins = await knex("admins").select("id").limit(1);
  if (admins.length === 0) {
    const passwordHash = bcrypt.hashSync("Admin123!", 10);
    await knex("admins").insert({
      id: uuidv4(),
      name: "Super Admin",
      username: "admin",
      email: "admin@example.com",
      password: passwordHash,
      status: "active",
      created_at: knex.fn.now(),
    });
  }
};

exports.down = async function (knex) {
  await knex("admins").where({ name: "Super Admin" }).del();
};
