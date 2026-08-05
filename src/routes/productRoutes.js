import { body, validationResult } from "express-validator";
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
  body("name").isString().notEmpty(),
  body("sku_code").isString().notEmpty(),
  body("category_id").optional().isUUID(),
  body("description").optional().isString(),
  body("barcode").optional().isString(),
  body("is_active").optional().isBoolean(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return productController.create(req, res);
  }
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  body("name").optional().isString(),
  body("sku_code").optional().isString(),
  body("category_id").optional().isUUID(),
  body("description").optional().isString(),
  body("barcode").optional().isString(),
  body("is_active").optional().isBoolean(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return productController.update(req, res);
  }
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
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const mime = req.file.mimetype || "";
    if (!mime.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Invalid file type" });
    }
    next();
  },
  productController.uploadImage,
);
router.put(
  "/:id/images/:imageId",
  authMiddleware,
  authorizeRole("admin"),
  upload.single("image"),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const mime = req.file.mimetype || "";
    if (!mime.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Invalid file type" });
    }
    next();
  },
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
