// 06_customers_transactions.js
import { v4 as uuidv4 } from "uuid";

export async function seed(knex) {
  // Remove old data first
  await knex("transactions").del();
  await knex("customers").del();

  await knex("customers").insert([
    {
      id: uuidv4(),
      name: "Budi Santoso",
      phone: "081234567890",
      email: "budi@email.com",
      total_spend: 0,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      name: "Siti Aminah",
      phone: "082345678901",
      email: "siti@email.com",
      total_spend: 0,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      name: "Agus Wijaya",
      phone: "083456789012",
      email: null,
      total_spend: 0,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      name: "Dewi Kusuma",
      phone: "084567890123",
      email: "dewi@email.com",
      total_spend: 0,
      status: "active",
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      name: "Rudi Hermawan",
      phone: null,
      email: null,
      total_spend: 0,
      status: "inactive",
      created_at: new Date(),
    },
  ]);
}
