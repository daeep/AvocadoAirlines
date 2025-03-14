const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../utils/db');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Itinerary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the itinerary
 *         user_id:
 *           type: integer
 *           description: ID of the user who created the itinerary
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *           description: Current status of the itinerary
 *         payment_status:
 *           type: string
 *           enum: [unpaid, paid, refunded]
 *           description: Payment status of the itinerary
 *         total_price:
 *           type: number
 *           format: float
 *           description: Total cost of all flights
 *         passenger_count:
 *           type: integer
 *           description: Number of passengers
 *         flights:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               flight_id:
 *                 type: integer
 *               sequence_number:
 *                 type: integer
 *               seat_numbers:
 *                 type: array
 *                 items:
 *                   type: string
 */

/**
 * @swagger
 * /itineraries/search:
 *   post:
 *     summary: Search for multi-city flights
 *     tags: [Itineraries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - segments
 *               - passengers
 *             properties:
 *               segments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - origin
 *                     - destination
 *                     - date
 *                   properties:
 *                     origin:
 *                       type: string
 *                       description: Origin airport code
 *                     destination:
 *                       type: string
 *                       description: Destination airport code
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: Flight date (YYYY-MM-DD)
 *               passengers:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 9
 *                 description: Number of passengers
 */
router.post(
  '/search',
  [
    body('segments').isArray({ min: 2 }).withMessage('At least 2 segments required for multi-city booking'),
    body('segments.*.origin').isLength({ min: 3, max: 3 }).withMessage('Valid airport code required'),
    body('segments.*.destination').isLength({ min: 3, max: 3 }).withMessage('Valid airport code required'),
    body('segments.*.date').isISO8601().withMessage('Valid date required'),
    body('passengers').isInt({ min: 1, max: 9 }).withMessage('Passengers must be between 1 and 9')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { segments, passengers } = req.body;
      const flightOptions = [];

      // Search flights for each segment
      for (const segment of segments) {
        const { origin, destination, date } = segment;
        
        // Convert date to timestamp range for the whole day
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const flights = await db.query(
          `SELECT * FROM flights 
           WHERE origin = $1 
           AND destination = $2 
           AND departure_time BETWEEN $3 AND $4
           AND available_seats >= $5
           ORDER BY departure_time`,
          [origin, destination, startDate, endDate, passengers]
        );

        if (flights.rows.length === 0) {
          return res.status(404).json({
            message: `No flights available from ${origin} to ${destination} on ${date}`
          });
        }

        flightOptions.push(flights.rows);
      }

      res.json(flightOptions);
    } catch (err) {
      logger.error('Multi-city search error', { error: err.message });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /itineraries:
 *   post:
 *     summary: Create a new multi-city itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flights
 *               - passengers
 *             properties:
 *               flights:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   description: Flight IDs in sequence
 *               passengers:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 9
 */
router.post(
  '/',
  authMiddleware,
  [
    body('flights').isArray({ min: 2 }).withMessage('At least 2 flights required'),
    body('flights.*').isInt().withMessage('Valid flight IDs required'),
    body('passengers').isInt({ min: 1, max: 9 }).withMessage('Passengers must be between 1 and 9')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const { flights: flightIds, passengers } = req.body;
      let totalPrice = 0;

      // Verify flights and calculate total price
      for (const flightId of flightIds) {
        const flight = await client.query(
          'SELECT price, available_seats FROM flights WHERE id = $1 FOR UPDATE',
          [flightId]
        );

        if (flight.rows.length === 0) {
          throw new Error(`Flight ${flightId} not found`);
        }

        if (flight.rows[0].available_seats < passengers) {
          throw new Error(`Not enough seats available on flight ${flightId}`);
        }

        totalPrice += flight.rows[0].price * passengers;
      }

      // Create itinerary
      const itinerary = await client.query(
        'INSERT INTO itineraries (user_id, total_price, passenger_count) VALUES ($1, $2, $3) RETURNING *',
        [req.user.id, totalPrice, passengers]
      );

      // Add flights to itinerary
      for (let i = 0; i < flightIds.length; i++) {
        await client.query(
          'INSERT INTO itinerary_flights (itinerary_id, flight_id, sequence_number) VALUES ($1, $2, $3)',
          [itinerary.rows[0].id, flightIds[i], i + 1]
        );

        // Update available seats
        await client.query(
          'UPDATE flights SET available_seats = available_seats - $1 WHERE id = $2',
          [passengers, flightIds[i]]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Itinerary created successfully',
        itinerary: {
          ...itinerary.rows[0],
          flights: flightIds.map((id, index) => ({
            flight_id: id,
            sequence_number: index + 1
          }))
        }
      });
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Itinerary creation error', { error: err.message });
      res.status(400).json({ message: err.message });
    } finally {
      client.release();
    }
  }
);

/**
 * @swagger
 * /itineraries/{id}:
 *   get:
 *     summary: Get itinerary details
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, 
              json_agg(json_build_object(
                'flight', f.*,
                'sequence_number', if.sequence_number,
                'seat_numbers', if.seat_numbers
              ) ORDER BY if.sequence_number) as flights
       FROM itineraries i
       JOIN itinerary_flights if ON i.id = if.itinerary_id
       JOIN flights f ON if.flight_id = f.id
       WHERE i.id = $1 AND i.user_id = $2
       GROUP BY i.id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Itinerary fetch error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /itineraries/{id}/cancel:
 *   post:
 *     summary: Cancel an itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Get itinerary details
    const itinerary = await client.query(
      'SELECT * FROM itineraries WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [req.params.id, req.user.id]
    );

    if (itinerary.rows.length === 0) {
      throw new Error('Itinerary not found');
    }

    if (itinerary.rows[0].status === 'cancelled') {
      throw new Error('Itinerary already cancelled');
    }

    // Get all flights in the itinerary
    const flights = await client.query(
      'SELECT * FROM itinerary_flights WHERE itinerary_id = $1',
      [req.params.id]
    );

    // Return seats to inventory
    for (const flight of flights.rows) {
      await client.query(
        'UPDATE flights SET available_seats = available_seats + $1 WHERE id = $2',
        [itinerary.rows[0].passenger_count, flight.flight_id]
      );
    }

    // Update itinerary status
    await client.query(
      'UPDATE itineraries SET status = $1, updated_at = NOW() WHERE id = $2',
      ['cancelled', req.params.id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Itinerary cancelled successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Itinerary cancellation error', { error: err.message });
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
});

module.exports = router; 