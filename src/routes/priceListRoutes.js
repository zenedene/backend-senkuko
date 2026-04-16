import express from "express";
const router = express.Router();
import priceListController from '../controllers/priceListController.js';

router.get('/', priceListController.getAll);
router.get('/:id', priceListController.getById);
router.post('/', priceListController.create);
router.put('/:id', priceListController.update);
router.delete('/:id', priceListController.remove);

export default router;