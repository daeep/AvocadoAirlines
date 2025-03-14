const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * @swagger
 * /airports:
 *   get:
 *     summary: Get list of airports with translations
 *     tags: [Airports]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         required: true
 *         description: Language code for airport names (e.g., 'en', 'es', 'fr')
 *     responses:
 *       200:
 *         description: List of airports with translations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Airport code (3 letters)
 *                   name:
 *                     type: string
 *                     description: Airport name in the requested language
 *                   city:
 *                     type: string
 *                     description: City name in the requested language
 *                   country:
 *                     type: string
 *                     description: Country name in the requested language
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    
    // Get all airports with the requested language OR English as fallback
    const result = await db.query(
      `SELECT 
        a.code,
        COALESCE(
          (SELECT name FROM airport_translations WHERE airport_id = a.id AND language_code = $1),
          (SELECT name FROM airport_translations WHERE airport_id = a.id AND language_code = 'en')
        ) AS name,
        COALESCE(
          (SELECT city FROM airport_translations WHERE airport_id = a.id AND language_code = $1),
          (SELECT city FROM airport_translations WHERE airport_id = a.id AND language_code = 'en')
        ) AS city,
        COALESCE(
          (SELECT country FROM airport_translations WHERE airport_id = a.id AND language_code = $1),
          (SELECT country FROM airport_translations WHERE airport_id = a.id AND language_code = 'en')
        ) AS country
      FROM airports a
      ORDER BY name ASC`,
      [language]
    );
    
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching airports:', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 