const { Router } = require('express');
const router = Router();
const ItemController = require('../controllers/itemController');
const { verifyUser } = require('../middleware/authMiddleWare');

// All routes are protected with authentication
router.use(verifyUser);

// Item registration
router.post('/', ItemController.registerItem);

// Get all items with filtering and pagination
router.get('/', ItemController.getItems);

// Get expired items
router.get('/expired', ItemController.getExpiredItems);

// Get a specific item by ID
router.get('/:id', ItemController.getItemById);

// Update an item
router.put('/:id', ItemController.updateItem);

// Check out an item and release RFID tag
router.put('/:id/checkout', ItemController.checkoutItem);

// Delete an item (admin only)
router.delete('/:id', ItemController.deleteItem);

module.exports = router;