// 15_admins.js
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function seed(knex) {
  await knex("admins").del();

  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await knex("admins").insert([
    {
      id: uuidv4(),
      name: "Super Admin",
      username: "admin",
      email: "admin@example.com",
      password: passwordHash,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      name: "Kasir Utama",
      username: "kasir1",
      email: "kasir@example.com",
      password: passwordHash,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      name: "Manajer Toko",
      username: "manager",
      email: "manager@example.com",
      password: passwordHash,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      name: "Kasir Weekend",
      username: "kasir2",
      email: "kasir-weekend@example.com",
      password: passwordHash,
      status: "inactive",
      created_at: new Date(),
    },
  ]);
}