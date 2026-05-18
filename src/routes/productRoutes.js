import express from "express";
const router = express.Router();
import productController from "../controllers/productController.js";
import { upload } from "../middlewares/upload.js";

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.get("/:id/variants", productController.getWithVariants);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);
router.get(
  "/:id/variants-with-price",
  productController.getWithVariantsAndPrice,
);
router.get("/:id/images", productController.getImages);
router.post(
  "/:id/images",
  upload.single("image"),
  productController.uploadImage,
);
router.put(
  "/:id/images/:imageId",
  upload.single("image"),
  productController.updateImage,
);
router.patch("/:id/images/:imageId/primary", productController.setPrimaryImage);
router.delete("/:id/images/:imageId", productController.deleteImage);

export default router;
