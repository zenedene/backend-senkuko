import express from "express";
const router = express.Router();
import productVariantController from '../controllers/productVariantController.js';

router.get('/', productVariantController.getAll);
router.get('/:id', productVariantController.getById);
router.get('/product/:productId', productVariantController.getByProduct);
router.post('/', productVariantController.create);
router.put('/:id', productVariantController.update);
router.delete('/:id', productVariantController.remove);

export default router;