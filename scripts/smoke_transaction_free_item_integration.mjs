import productPriceModel from "../src/models/productPriceModel.js";
import { v4 as uuidv4 } from "uuid";

// Monkeypatch findByVariantId to return mock prices
productPriceModel.findByVariantId = async (variantId) => {
  // Return a single price row matching the price_list_id used in test
  return [
    {
      id: "pp-1",
      min_qty: 1,
      price: "50000",
      is_active: 1,
      price_list_id: "pl-1",
      price_list_name: "Retail",
    },
  ];
};

(async () => {
  const price_list_id = "pl-1";

  // Validated items (as if validated earlier)
  const validatedItems = [
    {
      product_variant_id: "v-1",
      product_id: "p-1",
      category_id: "c-1",
      variant_name: "Variant 1",
      price_list_id,
      price_list_name: "Retail",
      qty: 1,
      unit_price: 60000,
      original_price: 60000,
      subtotal: 60000,
      stock_qty: 10,
    },
  ];

  const subtotal = validatedItems.reduce((s, it) => s + it.subtotal, 0);

  // Simulate applied promotions containing one free_item reward
  const promotion = { id: "promo-1", name: "Free Mug", code: "FREEMUG" };
  const transactionPromos = [
    {
      id: uuidv4(),
      promotion,
      voucherId: null,
      discountGiven: 0,
      appliedRewards: "[]",
    },
  ];

  const appliedPromotionSummary = [
    {
      promotion_id: promotion.id,
      promotion_name: promotion.name,
      promotion_code: promotion.code,
      applied_code: promotion.code,
      discount_type: "promo",
      voucher_id: null,
      discount_amount: 0,
      applied_rewards: [
        { reward_type: "free_item", discount_value: null, discount_mode: null },
      ],
    },
  ];

  const freeItemsToProcess = [
    { freeItem: { variantId: "v-free-1", qty: 2 }, promotionId: promotion.id },
  ];

  // Logic copied from transactionService processing
  let totalDiscount = 0;
  const freeItemsToInsert = [];

  for (const { freeItem, promotionId } of freeItemsToProcess) {
    try {
      const prices = await productPriceModel.findByVariantId(
        freeItem.variantId,
      );
      const applicablePrice = prices
        .filter(
          (p) =>
            p.price_list_id === price_list_id &&
            p.is_active &&
            p.min_qty <= freeItem.qty,
        )
        .sort((a, b) => b.min_qty - a.min_qty)[0];

      const unitPrice = applicablePrice ? parseFloat(applicablePrice.price) : 0;
      const discount = unitPrice * freeItem.qty;

      totalDiscount += discount;

      const tp = transactionPromos.find((t) => t.promotion.id === promotionId);
      if (tp) tp.discountGiven = (tp.discountGiven || 0) + discount;

      const aps = appliedPromotionSummary.find(
        (a) => a.promotion_id === promotionId,
      );
      if (aps) aps.discount_amount = (aps.discount_amount || 0) + discount;

      freeItemsToInsert.push({
        variantId: freeItem.variantId,
        qty: freeItem.qty,
        unit_price: unitPrice,
        discount,
        promotionId,
      });
    } catch (e) {
      freeItemsToInsert.push({
        variantId: freeItem.variantId,
        qty: freeItem.qty,
        unit_price: 0,
        discount: 0,
        promotionId,
      });
    }
  }

  totalDiscount = Math.min(totalDiscount, subtotal);
  const grandTotal = subtotal - totalDiscount;

  console.log("validatedItems:", validatedItems);
  console.log("freeItemsToInsert:", JSON.stringify(freeItemsToInsert, null, 2));
  console.log("transactionPromos:", JSON.stringify(transactionPromos, null, 2));
  console.log(
    "appliedPromotionSummary:",
    JSON.stringify(appliedPromotionSummary, null, 2),
  );
  console.log({ subtotal, totalDiscount, grandTotal });
})();
