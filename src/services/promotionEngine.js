import promotionModel from "../models/promotionModel.js";

/**
 * Evaluasi apakah semua conditions dari sebuah promo terpenuhi
 */
const evaluateConditions = (conditions, context) => {
  for (const condition of conditions) {
    const { condition_type, operator, value, target_type, target_id } =
      condition;
    let actual = null;

    if (condition_type === "min_transaction_amount") {
      actual = context.subtotal;
    } else if (condition_type === "min_qty") {
      actual = context.totalQty;
    } else if (condition_type === "specific_product") {
      const found = context.items.some((item) => item.product_id === target_id);
      if (!found) return false;
      continue;
    } else if (condition_type === "specific_category") {
      const found = context.items.some(
        (item) => item.category_id === target_id,
      );
      if (!found) return false;
      continue;
    }

    const numericValue = parseFloat(value);

    if (operator === "gte" && !(actual >= numericValue)) return false;
    if (operator === "lte" && !(actual <= numericValue)) return false;
    if (operator === "eq" && actual !== value) return false;
    if (operator === "in") {
      const list = value.split(",").map((v) => v.trim());
      if (!list.includes(String(actual))) return false;
    }
  }

  return true;
};

/**
 * Hitung diskon dari sebuah reward terhadap items dan subtotal
 */
const calculateReward = (reward, items, subtotal) => {
  const result = {
    discountAmount: 0,
    itemDiscounts: [],
    freeItems: [],
  };

  if (reward.reward_type === "discount_percent") {
    if (reward.discount_mode === "per_transaction") {
      let discount = (subtotal * reward.discount_value) / 100;
      if (reward.max_discount_amount > 0) {
        discount = Math.min(discount, parseFloat(reward.max_discount_amount));
      }
      result.discountAmount = discount;
    } else if (reward.discount_mode === "per_item") {
      for (const item of items) {
        const discount = (item.subtotal * reward.discount_value) / 100;
        result.itemDiscounts.push({
          variantId: item.product_variant_id,
          discount,
        });
        result.discountAmount += discount;
      }
    }
  } else if (reward.reward_type === "discount_fixed") {
    if (reward.discount_mode === "per_transaction") {
      let discount = parseFloat(reward.discount_value);
      if (reward.max_discount_amount > 0) {
        discount = Math.min(discount, parseFloat(reward.max_discount_amount));
      }
      result.discountAmount = Math.min(discount, subtotal);
    } else if (reward.discount_mode === "per_item") {
      for (const item of items) {
        const discount = Math.min(
          parseFloat(reward.discount_value),
          item.subtotal,
        );
        result.itemDiscounts.push({
          variantId: item.product_variant_id,
          discount,
        });
        result.discountAmount += discount;
      }
    }
  } else if (reward.reward_type === "free_item") {
    if (reward.free_variant_id && reward.free_qty > 0) {
      result.freeItems.push({
        variantId: reward.free_variant_id,
        qty: reward.free_qty,
      });
    }
  }

  return result;
};

/**
 * Main function: evaluasi semua promo yang dipilih user
 * Mengembalikan promo yang valid beserta kalkulasi diskonnya
 */
const applyPromotions = async (promoCodes, voucherCodes, context) => {
  const now = new Date();
  const appliedPromotions = [];
  let hasNonStackable = false;
  let nonStackablePromotion = null;

  const allRequestedCodes = [...(promoCodes || []), ...(voucherCodes || [])];

  for (const code of allRequestedCodes) {
    let promotion = null;
    let voucherId = null;

    // Cek apakah ini voucher code
    const voucher = await promotionModel.findVoucherByCode(code);
    if (voucher) {
      promotion = await promotionModel.findById(voucher.promotion_id);
      voucherId = voucher.id;

      if (
        voucher.usage_limit > 0 &&
        voucher.usage_count >= voucher.usage_limit
      ) {
        continue; // voucher sudah habis
      }
    } else {
      promotion = await promotionModel.findByCode(code);
    }

    if (!promotion) continue;
    if (!promotion.is_active) continue;
    if (promotion.valid_from && new Date(promotion.valid_from) > now) continue;
    if (promotion.valid_to && new Date(promotion.valid_to) < now) continue;
    if (
      promotion.usage_limit > 0 &&
      promotion.usage_count >= promotion.usage_limit
    )
      continue;

    const conditions = await promotionModel.findConditionsByPromotionId(
      promotion.id,
    );
    const conditionsMet = evaluateConditions(conditions, context);
    if (!conditionsMet) continue;

    const rewards = await promotionModel.findRewardsByPromotionId(promotion.id);

    // Handle stackable logic
    if (!promotion.stackable) {
      if (hasNonStackable) continue; // sudah ada non-stackable, skip
      hasNonStackable = true;
      nonStackablePromotion = { promotion, rewards, voucherId };
      continue;
    }

    appliedPromotions.push({ promotion, rewards, voucherId });
  }

  // Masukkan non-stackable jika ada (yang created_at paling lama sudah dihandle
  // karena findActivePromotions ORDER BY created_at ASC dan kita ambil yang pertama)
  if (nonStackablePromotion) {
    appliedPromotions.unshift(nonStackablePromotion);
  }

  return appliedPromotions;
};

export { applyPromotions, calculateReward };
