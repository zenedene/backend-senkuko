// 06_customers_transactions.js
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function seed(knex) {
  // Remove old data first
  await knex("transactions").del();
  await knex("customers").del();

  const passwordHash = await bcrypt.hash("password123", 10);

  await knex("customers").insert([
    {
      id: uuidv4(),
      code: "CUST-BUDI001",
      name: "Budi Santoso",
      phone: "081234567890",
      email: "budi@email.com",
      password: passwordHash,
      total_spend: 0,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      code: "CUST-SITI002",
      name: "Siti Aminah",
      phone: "082345678901",
      email: "siti@email.com",
      password: passwordHash,
      total_spend: 0,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      code: "CUST-AGUS003",
      name: "Agus Wijaya",
      phone: "083456789012",
      email: null,
      password: passwordHash,
      total_spend: 0,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      code: "CUST-DEWI004",
      name: "Dewi Kusuma",
      phone: "084567890123",
      email: "dewi@email.com",
      password: passwordHash,
      total_spend: 0,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      code: "CUST-RUDI005",
      name: "Rudi Hermawan",
      phone: null,
      email: null,
      password: null,
      total_spend: 0,
      status: "inactive",
      created_at: new Date(),
    },
  ]);
}
