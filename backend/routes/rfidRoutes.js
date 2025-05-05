const { Router } = require('express');
const router = Router();
const RfidController = require('../controllers/rfidController');
const { verifyUser } = require('../middleware/authMiddleWare');

// All routes are protected with authentication
router.use(verifyUser);

// Register a new RFID tag
router.post('/register', RfidController.registerRfid);

// Get all RFID tags
router.get('/', RfidController.getRfidTags);

// Delete an RFID tag
router.delete('/:rfid', RfidController.deleteRfid);

module.exports = router;