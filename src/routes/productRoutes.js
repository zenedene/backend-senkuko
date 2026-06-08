import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import productController from "../controllers/productController.js";
import { upload } from "../middlewares/upload.js";
const router = express.Router();

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.get("/:id/variants", productController.getWithVariants);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  productController.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  productController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  productController.remove,
);
router.get(
  "/:id/variants-with-price",
  productController.getWithVariantsAndPrice,
);
router.get("/:id/images", productController.getImages);
router.post(
  "/:id/images",
  authMiddleware,
  authorizeRole("admin"),
  upload.single("image"),
  productController.uploadImage,
);
router.put(
  "/:id/images/:imageId",
  authMiddleware,
  authorizeRole("admin"),
  upload.single("image"),
  productController.updateImage,
);
router.patch(
  "/:id/images/:imageId/primary",
  authMiddleware,
  authorizeRole("admin"),
  productController.setPrimaryImage,
);
router.delete(
  "/:id/images/:imageId",
  authMiddleware,
  authorizeRole("admin"),
  productController.deleteImage,
);

export default router;
