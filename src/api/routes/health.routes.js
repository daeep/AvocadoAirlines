const express = require('express');
const router = express.Router();
const db = require('../utils/db');

/**
 * @route GET /api/health
 * @description Health check endpoint for API
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbResult = await db.query('SELECT 1');
    
    // Get system info
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
      database: dbResult.rows.length === 1 ? 'connected' : 'error'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
});

module.exports = router; 