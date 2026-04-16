import express from "express";
const router = express.Router();
import categoryController from '../controllers/categoryController.js';

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.get('/:id/children', categoryController.getWithChildren);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.remove);

export default router;