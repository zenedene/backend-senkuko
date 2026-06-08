import { Router } from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import * as promotionController from "../controllers/promotionController.js";

const router = Router();

router.get("/", promotionController.getAll);
router.get("/:id", promotionController.getById);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  promotionController.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  promotionController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  promotionController.remove,
);
router.post(
  "/:id/conditions",
  authMiddleware,
  authorizeRole("admin"),
  promotionController.addCondition,
);
router.delete(
  "/:id/conditions/:conditionId",
  authMiddleware,
  authorizeRole("admin"),
  promotionController.deleteCondition,
);
router.post(
  "/:id/rewards",
  authMiddleware,
  authorizeRole("admin"),
  promotionController.addReward,
);
router.delete(
  "/:id/rewards/:rewardId",
  authMiddleware,
  authorizeRole("admin"),
  promotionController.deleteReward,
);

export default router;
