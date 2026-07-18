import { calculateReward } from "../src/services/promotionEngine.js";

const reward = {
  reward_type: "free_item",
  free_variant_id: "variant-123",
  free_qty: 2,
};

const items = [
  { product_variant_id: "variant-123", subtotal: 150 },
  { product_variant_id: "variant-456", subtotal: 200 },
];

const subtotal = items.reduce((s, it) => s + it.subtotal, 0);

const result = calculateReward(reward, items, subtotal);
console.log("calculateReward result:");
console.log(JSON.stringify(result, null, 2));
