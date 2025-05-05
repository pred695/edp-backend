// routes/roiRoutes.js
const { Router } = require('express');
const router = Router();
const RoiController = require('../controllers/roiController');
const { verifyUser } = require('../middleware/authMiddleWare');

// All routes are protected with authentication
router.use(verifyUser);

// Upload a ROI video
router.post('/', RoiController.uploadRoiVideo);

// Get all ROI videos with pagination
router.get('/', RoiController.getRoiVideos);

// Get a specific ROI video by ID
router.get('/:id', RoiController.getRoiVideoById);

// Stream ROI video file
router.get('/:id/stream', RoiController.streamRoiVideo);

// Delete a ROI video
router.delete('/:id', RoiController.deleteRoiVideo);

module.exports = router;