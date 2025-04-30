const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const port = 3000;
const pool = require('./config');

const corsOptions = {
  origin: ['http://localhost:5173'],
  methods: 'GET, POST, PUT, DELETE, PATCH',
  credentials: true,
  optionsSuccessStatus: 200,
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.use(cookieParser());

// Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json('This is the edp backend API.');
});

// Test database connection endpoint
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'success',
      message: 'Database connection successful',
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Get all items endpoint
app.get('/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      error: 'Failed to fetch items',
      details: error.message,
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
