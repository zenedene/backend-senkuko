import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import productVariantController from "../controllers/productVariantController.js";
const router = express.Router();

router.get("/", productVariantController.getAll);
router.get("/:id", productVariantController.getById);
router.get("/product/:productId", productVariantController.getByProduct);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  productVariantController.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  productVariantController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  productVariantController.remove,
);

export default router;
