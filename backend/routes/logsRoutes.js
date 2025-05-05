// routes/logsRoutes.js
const { Router } = require('express');
const router = Router();
const LogsController = require('../controllers/logsController');
const { verifyUser } = require('../middleware/authMiddleWare');

// All routes are protected with authentication
router.use(verifyUser);

// Upload a log file
router.post('/', LogsController.uploadLog);

// Get all logs with pagination
router.get('/', LogsController.getLogs);

// Get a specific log by ID
router.get('/:id', LogsController.getLogById);

// Get log content for viewing or downloading
router.get('/:id/content', LogsController.getLogContent);

// Delete a log file
router.delete('/:id', LogsController.deleteLog);

module.exports = router;