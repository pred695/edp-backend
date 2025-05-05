// controllers/videoController.js
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const pool = require('../config');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Accept only video files
    const filetypes = /mp4|avi|mov|mkv|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
}).single('video');

// Promisify multer upload
const uploadPromise = promisify(upload);

// @desc    Upload a video file
// @route   POST /api/videos
// @access  Private
module.exports.uploadVideo = async (req, res) => {
  try {
    // Handle file upload
    await uploadPromise(req, res);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }
    
    const { 
      filename,
      originalname, 
      size,
      mimetype
    } = req.file;
    
    const { camera_id } = req.body;
    
    // Insert video record into database
    const result = await pool.query(
      `INSERT INTO videos (
        filename, 
        original_filename, 
        size_bytes, 
        format,
        camera_id
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        filename,
        originalname,
        size,
        mimetype,
        camera_id
      ]
    );
    
    // Return success response
    res.status(201).json({
      message: 'Video uploaded successfully',
      video: result.rows[0]
    });
    
    // Optionally start processing the video in background
    // processVideo(result.rows[0].id);
    
  } catch (err) {
    console.error('Error uploading video:', err);
    res.status(500).json({ 
      message: 'Error uploading video', 
      error: err.message 
    });
  }
};

// @desc    Get all videos with pagination
// @route   GET /api/videos
// @access  Private
module.exports.getVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM videos');
    const totalVideos = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalVideos / limit);
    
    // Get videos with pagination
    const result = await pool.query(
      `SELECT v.*, c.camera_id 
       FROM videos v
       LEFT JOIN camera c ON v.camera_id = c.camera_id
       ORDER BY v.upload_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    res.status(200).json({
      videos: result.rows,
      pagination: {
        total: totalVideos,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ 
      message: 'Error fetching videos', 
      error: err.message 
    });
  }
};

// @desc    Get video details by ID
// @route   GET /api/videos/:id
// @access  Private
module.exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT v.*, c.camera_id 
       FROM videos v
       LEFT JOIN camera c ON v.camera_id = c.camera_id
       WHERE v.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({ 
      message: 'Error fetching video', 
      error: err.message 
    });
  }
};

// @desc    Update video status and results
// @route   PUT /api/videos/:id
// @access  Private
module.exports.updateVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, results } = req.body;
    
    // Update video status
    const result = await pool.query(
      `UPDATE videos 
       SET status = $1, 
           results = $2,
           processed_date = CASE WHEN $1 = 'completed' OR $1 = 'failed' THEN CURRENT_TIMESTAMP ELSE processed_date END
       WHERE id = $3
       RETURNING *`,
      [status, results ? JSON.stringify(results) : null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.status(200).json({
      message: 'Video status updated',
      video: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating video status:', err);
    res.status(500).json({ 
      message: 'Error updating video status', 
      error: err.message 
    });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private (Admin only)
module.exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get video details to delete file
    const videoResult = await pool.query(
      'SELECT filename FROM videos WHERE id = $1',
      [id]
    );
    
    if (videoResult.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const filename = videoResult.rows[0].filename;
    
    // Delete from database
    await pool.query('DELETE FROM videos WHERE id = $1', [id]);
    
    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(200).json({ 
      message: 'Video deleted successfully',
      id
    });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ 
      message: 'Error deleting video', 
      error: err.message 
    });
  }
};

// @desc    Stream video file
// @route   GET /api/videos/:id/stream
// @access  Private
module.exports.streamVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the video information from the database
    const videoResult = await pool.query(
      'SELECT * FROM videos WHERE id = $1',
      [id]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const video = videoResult.rows[0];
    
    // Construct the path to the video file
    const fs = require('fs');
    const path = require('path');
    
    // Use the correct path to the uploads directory
    // __dirname is controllers directory, so go up one level to get to backend directory
    const videoPath = path.join(__dirname, '../uploads', video.filename);
    console.log("Video path:", videoPath);
    
    // Check if the file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Video file not found', path: videoPath });
    }

    // Get file stats
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Handle range requests (for video seeking)
    if (range) {
      // Parse Range
      // Example: "bytes=32324-"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      // Create response headers
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.format || 'video/mp4',
      };

      // Send partial content
      res.writeHead(206, headers);
      file.pipe(res);
    } else {
      // Send entire file if no range is requested
      const headers = {
        'Content-Length': fileSize,
        'Content-Type': video.format || 'video/mp4',
      };
      
      res.writeHead(200, headers);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    console.error('Error streaming video:', err);
    res.status(500).json({ 
      message: 'Error streaming video', 
      error: err.message 
    });
  }
};