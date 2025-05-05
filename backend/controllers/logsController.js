// controllers/logsController.js
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const pool = require('../config');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Set up storage for multer for log files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/logs');
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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Accept log files (text, csv, etc)
    const filetypes = /txt|log|csv|json|xml/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only log files (txt, log, csv, json, xml) are allowed!'));
    }
  }
}).single('log');

// Promisify multer upload
const uploadPromise = promisify(upload);

// @desc    Upload a log file
// @route   POST /api/logs
// @access  Private
module.exports.uploadLog = async (req, res) => {
  try {
    // Handle file upload
    await uploadPromise(req, res);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No log file uploaded' });
    }
    
    const { 
      filename,
      originalname, 
      size,
      mimetype
    } = req.file;
    
    // Insert log record into database
    const result = await pool.query(
      `INSERT INTO rfid_logs (
        filename, 
        original_filename, 
        size_bytes, 
        format
      ) VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        filename,
        originalname,
        size,
        mimetype || 'text/plain'
      ]
    );
    
    // Return success response
    res.status(201).json({
      message: 'Log file uploaded successfully',
      log: result.rows[0]
    });
    
  } catch (err) {
    console.error('Error uploading log file:', err);
    res.status(500).json({ 
      message: 'Error uploading log file', 
      error: err.message 
    });
  }
};

// @desc    Get all logs with pagination
// @route   GET /api/logs
// @access  Private
module.exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM rfid_logs');
    const totalLogs = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalLogs / limit);
    
    // Get logs with pagination
    const result = await pool.query(
      `SELECT * FROM rfid_logs
       ORDER BY upload_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    res.status(200).json({
      logs: result.rows,
      pagination: {
        total: totalLogs,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ 
      message: 'Error fetching logs', 
      error: err.message 
    });
  }
};

// @desc    Get log file by ID
// @route   GET /api/logs/:id
// @access  Private
module.exports.getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM rfid_logs WHERE file_id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Log file not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching log file:', err);
    res.status(500).json({ 
      message: 'Error fetching log file', 
      error: err.message 
    });
  }
};

// @desc    Download or view log file content
// @route   GET /api/logs/:id/content
// @access  Private
module.exports.getLogContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the log information from the database
    const logResult = await pool.query(
      'SELECT * FROM rfid_logs WHERE file_id = $1',
      [id]
    );

    if (logResult.rows.length === 0) {
      return res.status(404).json({ message: 'Log file not found' });
    }

    const log = logResult.rows[0];
    
    // Construct the path to the log file
    const logPath = path.join(__dirname, '../uploads/logs', log.filename);
    
    // Check if the file exists
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ message: 'Log file not found on disk', path: logPath });
    }

    // Determine if this is a download request or a view request
    const { download } = req.query;
    
    if (download === 'true') {
      // Download the file
      res.download(logPath, log.original_filename);
    } else {
      // Read file and send its content
      fs.readFile(logPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading log file:', err);
          return res.status(500).json({ 
            message: 'Error reading log file', 
            error: err.message 
          });
        }
        
        // Set content type based on the file format
        const contentType = log.format || 'text/plain';
        res.set('Content-Type', contentType);
        res.send(data);
      });
    }
  } catch (err) {
    console.error('Error retrieving log content:', err);
    res.status(500).json({ 
      message: 'Error retrieving log content', 
      error: err.message 
    });
  }
};

// @desc    Delete a log file
// @route   DELETE /api/logs/:id
// @access  Private (Admin only)
module.exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get log details to delete file
    const logResult = await pool.query(
      'SELECT filename FROM rfid_logs WHERE file_id = $1',
      [id]
    );
    
    if (logResult.rows.length === 0) {
      return res.status(404).json({ message: 'Log file not found' });
    }
    
    const filename = logResult.rows[0].filename;
    
    // Delete from database
    await pool.query('DELETE FROM rfid_logs WHERE file_id = $1', [id]);
    
    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads/logs', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(200).json({ 
      message: 'Log file deleted successfully',
      id
    });
  } catch (err) {
    console.error('Error deleting log file:', err);
    res.status(500).json({ 
      message: 'Error deleting log file', 
      error: err.message 
    });
  }
};