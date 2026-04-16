import express from "express";
const router = express.Router();
import unitController from '../controllers/unitController.js';

router.get('/', unitController.getAll);
router.get('/:id', unitController.getById);
router.post('/', unitController.create);
router.put('/:id', unitController.update);
router.delete('/:id', unitController.remove);

export default router;