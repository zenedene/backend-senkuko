import express from "express";
const router = express.Router();
import productPriceController from '../controllers/productPriceController.js';

router.get('/', productPriceController.getAll);
router.get('/:id', productPriceController.getById);
router.get('/variant/:variantId', productPriceController.getByVariant);
router.post('/', productPriceController.create);
router.put('/:id', productPriceController.update);
router.delete('/:id', productPriceController.remove);

export default router;