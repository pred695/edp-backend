const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Database and Routes
const pool = require('./config');
const userRoutes = require('./routes/userRoutes');

// Enhanced CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Create Express App
const app = express();

// Security and Parsing Middleware
app.use(express.json({
  limit: '1mb', // Prevent large payload attacks
}));
app.use(express.urlencoded({ 
  extended: false,
}));
app.use(cors(corsOptions));
app.use(cookieParser());


// Health Check and Database Test Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'EDP Backend API is running',
    environment: ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'success',
      message: 'Database connection successful',
      time: result.rows[0].now,
      environment: ENVIRONMENT
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Items Endpoint with Pagination and Error Handling
app.get('/items', async (req, res) => {
  try {
    // Optional pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM items');
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      'SELECT * FROM items LIMIT $1 OFFSET $2', 
      [limit, offset]
    );

    res.status(200).json({
      items: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch items',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// User Routes
app.use('/api/users', userRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'An unexpected error occurred',
    ...(ENVIRONMENT === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Server and Database Lifecycle Management
const startServer = async () => {
  try {
    // Optionally test database connection before starting server
    await pool.query('SELECT NOW()');
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running in ${ENVIRONMENT} mode on port ${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('HTTP server closed.');
        
        pool.end(() => {
          console.log('Database pool closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app; // For testing purposes