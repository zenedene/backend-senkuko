const express = require('express');
const router = express.Router();
const productVariantController = require('../controllers/productVariantController');

router.get('/', productVariantController.getAll);
router.get('/:id', productVariantController.getById);
router.get('/product/:productId', productVariantController.getByProduct);
router.post('/', productVariantController.create);
router.put('/:id', productVariantController.update);
router.delete('/:id', productVariantController.remove);

module.exports = router;