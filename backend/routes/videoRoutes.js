// routes/videoRoutes.js
const { Router } = require('express');
const router = Router();
const VideoController = require('../controllers/videoController');
const { verifyUser } = require('../middleware/authMiddleWare');

// All routes are protected with authentication
router.use(verifyUser);

// Upload a video
router.post('/', VideoController.uploadVideo);

// Get all videos with pagination
router.get('/', VideoController.getVideos);

// Get a specific video by ID
router.get('/:id', VideoController.getVideoById);

// Stream video file
router.get('/:id/stream', VideoController.streamVideo);

// Update video status and results
router.put('/:id', VideoController.updateVideoStatus);

// Delete a video
router.delete('/:id', VideoController.deleteVideo);

module.exports = router;