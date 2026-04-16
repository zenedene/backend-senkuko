import express from "express";
const router = express.Router();
import productController from '../controllers/productController.js';

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.get('/:id/variants', productController.getWithVariants);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

export default router;