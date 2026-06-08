import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import priceListController from "../controllers/priceListController.js";
const router = express.Router();

router.get("/", priceListController.getAll);
router.get("/:id", priceListController.getById);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  priceListController.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  priceListController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  priceListController.remove,
);

export default router;
