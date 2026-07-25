import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import bannerController from "../controllers/bannerController.js";
import { upload } from "../middlewares/upload.js";
const router = express.Router();

router.get("/", bannerController.getAll);
router.get("/active", bannerController.getActive);
router.get("/:id", bannerController.getById);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  upload.single("image"),
  bannerController.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  bannerController.update,
);
router.put(
  "/:id/image",
  authMiddleware,
  authorizeRole("admin"),
  upload.single("image"),
  bannerController.updateImage,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  bannerController.remove,
);

export default router;
