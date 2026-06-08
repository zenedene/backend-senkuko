import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import productPriceController from "../controllers/productPriceController.js";
const router = express.Router();

router.get("/", productPriceController.getAll);
router.get("/:id", productPriceController.getById);
router.get("/variant/:variantId", productPriceController.getByVariant);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  productPriceController.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  productPriceController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  productPriceController.remove,
);

export default router;
