const express = require('express');
const router = express.Router();
const productPriceController = require('../controllers/productPriceController');

router.get('/', productPriceController.getAll);
router.get('/:id', productPriceController.getById);
router.get('/variant/:variantId', productPriceController.getByVariant);
router.post('/', productPriceController.create);
router.put('/:id', productPriceController.update);
router.delete('/:id', productPriceController.remove);

module.exports = router;