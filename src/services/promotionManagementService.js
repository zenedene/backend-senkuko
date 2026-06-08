import { v4 as uuidv4 } from "uuid";
import promotionManagementModel from "../models/promotionManagementModel.js";

const VALID_TYPES = ["discount_percent", "discount_fixed", "free_item"];
const VALID_CONDITION_TYPES = [
  "min_transaction_amount",
  "min_qty",
  "specific_product",
  "specific_category",
];
const VALID_OPERATORS = ["gte", "lte", "eq", "in"];
const VALID_REWARD_TYPES = ["discount_percent", "discount_fixed", "free_item"];
const VALID_DISCOUNT_MODES = ["per_transaction", "per_item"];

const getAllPromotions = async () => {
  return await promotionManagementModel.findAll();
};

const getPromotionById = async (id) => {
  const promotion = await promotionManagementModel.findById(id);
  if (!promotion) throw new Error("Promotion not found");

  const conditions =
    await promotionManagementModel.findConditionsByPromotionId(id);
  const rewards = await promotionManagementModel.findRewardsByPromotionId(id);

  return { ...promotion, conditions, rewards };
};

const createPromotion = async (data) => {
  if (!data.name) throw new Error("Promotion name is required");
  if (!data.code) throw new Error("Promotion code is required");
  if (!data.type) throw new Error("Promotion type is required");
  if (!VALID_TYPES.includes(data.type)) {
    throw new Error(`Invalid type. Valid values: ${VALID_TYPES.join(", ")}`);
  }

  const existing = await promotionManagementModel.findByCode(data.code);
  if (existing) throw new Error("Promotion code already exists");

  if (data.valid_from && data.valid_to) {
    if (new Date(data.valid_from) >= new Date(data.valid_to)) {
      throw new Error("valid_from must be earlier than valid_to");
    }
  }

  return await promotionManagementModel.create({ ...data, id: uuidv4() });
};

const updatePromotion = async (id, data) => {
  const existing = await promotionManagementModel.findById(id);
  if (!existing) throw new Error("Promotion not found");

  if (!data.name) throw new Error("Promotion name is required");
  if (!data.type) throw new Error("Promotion type is required");
  if (!VALID_TYPES.includes(data.type)) {
    throw new Error(`Invalid type. Valid values: ${VALID_TYPES.join(", ")}`);
  }

  if (data.code && data.code !== existing.code) {
    const duplicate = await promotionManagementModel.findByCode(data.code);
    if (duplicate) throw new Error("Promotion code already exists");
  }

  if (data.valid_from && data.valid_to) {
    if (new Date(data.valid_from) >= new Date(data.valid_to)) {
      throw new Error("valid_from must be earlier than valid_to");
    }
  }

  return await promotionManagementModel.update(id, data);
};

const deletePromotion = async (id) => {
  const existing = await promotionManagementModel.findById(id);
  if (!existing) throw new Error("Promotion not found");

  const usage = await promotionManagementModel.countUsage(id);
  if (usage > 0)
    throw new Error(
      "Cannot delete promotion that has been used in transactions",
    );

  const affected = await promotionManagementModel.remove(id);
  if (!affected) throw new Error("Failed to delete promotion");
  return { message: "Promotion deleted successfully" };
};

const addCondition = async (promotionId, data) => {
  const promotion = await promotionManagementModel.findById(promotionId);
  if (!promotion) throw new Error("Promotion not found");

  if (!data.condition_type) throw new Error("condition_type is required");
  if (!data.operator) throw new Error("operator is required");
  if (!data.value) throw new Error("value is required");

  if (!VALID_CONDITION_TYPES.includes(data.condition_type)) {
    throw new Error(
      `Invalid condition_type. Valid values: ${VALID_CONDITION_TYPES.join(", ")}`,
    );
  }

  if (!VALID_OPERATORS.includes(data.operator)) {
    throw new Error(
      `Invalid operator. Valid values: ${VALID_OPERATORS.join(", ")}`,
    );
  }

  if (
    ["specific_product", "specific_category"].includes(data.condition_type) &&
    !data.target_id
  ) {
    throw new Error(
      "target_id is required for specific_product and specific_category conditions",
    );
  }

  return await promotionManagementModel.createCondition({
    ...data,
    id: uuidv4(),
    promotion_id: promotionId,
  });
};

const removeCondition = async (promotionId, conditionId) => {
  const promotion = await promotionManagementModel.findById(promotionId);
  if (!promotion) throw new Error("Promotion not found");

  const condition =
    await promotionManagementModel.findConditionById(conditionId);
  if (!condition) throw new Error("Condition not found");
  if (condition.promotion_id !== promotionId)
    throw new Error("Condition does not belong to this promotion");

  const affected = await promotionManagementModel.removeCondition(conditionId);
  if (!affected) throw new Error("Failed to delete condition");
  return { message: "Condition deleted successfully" };
};

const addReward = async (promotionId, data) => {
  const promotion = await promotionManagementModel.findById(promotionId);
  if (!promotion) throw new Error("Promotion not found");

  if (!data.reward_type) throw new Error("reward_type is required");
  if (!VALID_REWARD_TYPES.includes(data.reward_type)) {
    throw new Error(
      `Invalid reward_type. Valid values: ${VALID_REWARD_TYPES.join(", ")}`,
    );
  }

  if (data.reward_type !== "free_item") {
    if (!data.discount_value || data.discount_value <= 0) {
      throw new Error("discount_value must be greater than 0");
    }
    if (!data.discount_mode) throw new Error("discount_mode is required");
    if (!VALID_DISCOUNT_MODES.includes(data.discount_mode)) {
      throw new Error(
        `Invalid discount_mode. Valid values: ${VALID_DISCOUNT_MODES.join(", ")}`,
      );
    }
  }

  if (data.reward_type === "free_item") {
    if (!data.free_variant_id)
      throw new Error("free_variant_id is required for free_item reward");
    if (!data.free_qty || data.free_qty <= 0)
      throw new Error("free_qty must be greater than 0");
  }

  return await promotionManagementModel.createReward({
    ...data,
    id: uuidv4(),
    promotion_id: promotionId,
  });
};

const removeReward = async (promotionId, rewardId) => {
  const promotion = await promotionManagementModel.findById(promotionId);
  if (!promotion) throw new Error("Promotion not found");

  const reward = await promotionManagementModel.findRewardById(rewardId);
  if (!reward) throw new Error("Reward not found");
  if (reward.promotion_id !== promotionId)
    throw new Error("Reward does not belong to this promotion");

  const affected = await promotionManagementModel.removeReward(rewardId);
  if (!affected) throw new Error("Failed to delete reward");
  return { message: "Reward deleted successfully" };
};

export {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  addCondition,
  removeCondition,
  addReward,
  removeReward,
};
