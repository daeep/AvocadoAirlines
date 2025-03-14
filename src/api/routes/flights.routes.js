const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const db = require('../utils/db');
const logger = require('../utils/logger');
const { isValidDate, isValidAirportCode, isValidDateRange } = require('../utils/validators');

/**
 * @swagger
 * components:
 *   schemas:
 *     Flight:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the flight
 *         flight_number:
 *           type: string
 *           description: The flight number
 *         origin:
 *           type: string
 *           description: Origin airport code (3 letters)
 *         destination:
 *           type: string
 *           description: Destination airport code (3 letters)
 *         departure_time:
 *           type: string
 *           format: date-time
 *           description: Flight departure time
 *         arrival_time:
 *           type: string
 *           format: date-time
 *           description: Flight arrival time
 *         price:
 *           type: number
 *           format: float
 *           description: Flight price
 *         available_seats:
 *           type: integer
 *           description: Number of available seats
 *         total_seats:
 *           type: integer
 *           description: Total number of seats on the flight
 *       example:
 *         id: 1
 *         flight_number: "AA101"
 *         origin: "LAX"
 *         destination: "JFK"
 *         departure_time: "2023-12-01T08:00:00.000Z"
 *         arrival_time: "2023-12-01T16:30:00.000Z"
 *         price: 299.99
 *         available_seats: 150
 *         total_seats: 180
 */

/**
 * @swagger
 * /flights/search:
 *   get:
 *     summary: Search for flights based on criteria
 *     tags: [Flights]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         required: true
 *         description: Origin airport code (3 uppercase letters)
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         required: true
 *         description: Destination airport code (3 uppercase letters)
 *       - in: query
 *         name: departureDate
 *         schema:
 *           type: string
 *         required: true
 *         description: Departure date (MM/DD/YYYY)
 *       - in: query
 *         name: returnDate
 *         schema:
 *           type: string
 *         required: false
 *         description: Return date for round trips (MM/DD/YYYY)
 *       - in: query
 *         name: passengers
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 9
 *         required: true
 *         description: Number of passengers (1-9)
 *     responses:
 *       200:
 *         description: Flight search successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 outboundFlights:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flight'
 *                 returnFlights:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flight'
 *       400:
 *         description: Invalid input parameters
 *       500:
 *         description: Server error
 */
router.get(
  '/search',
  [
    // Validation
    query('origin').custom(value => {
      if (!isValidAirportCode(value)) {
        throw new Error('Invalid origin airport code');
      }
      return true;
    }),
    query('destination').custom(value => {
      if (!isValidAirportCode(value)) {
        throw new Error('Invalid destination airport code');
      }
      return true;
    }),
    query('departureDate').custom(value => {
      if (!isValidDate(value)) {
        throw new Error('Invalid departure date format (MM/DD/YYYY)');
      }
      return true;
    }),
    query('returnDate').optional().custom((value, { req }) => {
      if (value && !isValidDate(value)) {
        throw new Error('Invalid return date format (MM/DD/YYYY)');
      }
      
      if (value && !isValidDateRange(req.query.departureDate, value)) {
        throw new Error('Return date must be after departure date');
      }
      return true;
    }),
    query('passengers').isInt({ min: 1, max: 9 }).withMessage('Passengers must be between 1 and 9')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { origin, destination, departureDate, returnDate, passengers } = req.query;

    try {
      // Parse dates from MM/DD/YYYY to YYYY-MM-DD for DB query
      const parsedDepartureDate = parseDateString(departureDate);
      
      // Search for outbound flights
      const outboundFlights = await searchFlights(origin, destination, parsedDepartureDate, passengers);
      
      // Search for return flights if round trip
      let returnFlights = [];
      if (returnDate) {
        const parsedReturnDate = parseDateString(returnDate);
        returnFlights = await searchFlights(destination, origin, parsedReturnDate, passengers);
      }

      res.json({
        outboundFlights,
        returnFlights
      });
    } catch (err) {
      logger.error('Flight search error', { error: err.message });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /flights/deals:
 *   get:
 *     summary: Get special flight deals for the next two weeks
 *     tags: [Flights]
 *     security: []
 *     responses:
 *       200:
 *         description: List of flight deals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Flight'
 *       500:
 *         description: Server error
 */
router.get('/deals', async (req, res) => {
  try {
    // Get start and end dates for the next two weeks
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    endDate.setHours(23, 59, 59, 999);

    // Query flights with special pricing (lower than average) for the next two weeks
    const result = await db.query(
      `WITH avg_prices AS (
        SELECT origin, destination, AVG(price) as avg_price
        FROM flights
        GROUP BY origin, destination
      )
      SELECT f.*, 
             at1.name as origin_name, at1.city as origin_city, at1.country as origin_country,
             at2.name as destination_name, at2.city as destination_city, at2.country as destination_country,
             ROUND((ap.avg_price - f.price) / ap.avg_price * 100) as discount_percentage
      FROM flights f
      JOIN avg_prices ap ON f.origin = ap.origin AND f.destination = ap.destination
      JOIN airports a1 ON f.origin = a1.code
      JOIN airports a2 ON f.destination = a2.code
      JOIN airport_translations at1 ON a1.id = at1.airport_id AND at1.language_code = 'en'
      JOIN airport_translations at2 ON a2.id = at2.airport_id AND at2.language_code = 'en'
      WHERE f.departure_time BETWEEN $1 AND $2
      AND f.price < ap.avg_price
      AND f.available_seats > 0
      ORDER BY discount_percentage DESC
      LIMIT 4`,
      [startDate.toISOString(), endDate.toISOString()]
    );

    // Transform the results to include formatted information
    const deals = result.rows.map(flight => ({
      id: flight.id,
      flightNumber: flight.flight_number,
      origin: {
        code: flight.origin,
        name: flight.origin_name,
        city: flight.origin_city,
        country: flight.origin_country
      },
      destination: {
        code: flight.destination,
        name: flight.destination_name,
        city: flight.destination_city,
        country: flight.destination_country
      },
      departureTime: flight.departure_time,
      arrivalTime: flight.arrival_time,
      price: Number(flight.price),
      originalPrice: Number(flight.price * (1 + flight.discount_percentage / 100)),
      discountPercentage: Number(flight.discount_percentage),
      availableSeats: flight.available_seats
    }));

    res.json(deals);
  } catch (err) {
    logger.error('Flight deals error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /flights/{id}:
 *   get:
 *     summary: Get flight details by ID
 *     tags: [Flights]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The flight ID
 *     responses:
 *       200:
 *         description: Flight details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Flight'
 *       404:
 *         description: Flight not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM flights WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Flight details error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Helper function to search flights
 */
async function searchFlights(origin, destination, date, passengers) {
  // Convert the date string to date object and get start/end of day
  const searchDate = new Date(date);
  const startDate = new Date(searchDate);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(searchDate);
  endDate.setHours(23, 59, 59, 999);

  // Query flights
  const result = await db.query(
    `SELECT * FROM flights 
     WHERE origin = $1 
     AND destination = $2
     AND departure_time BETWEEN $3 AND $4
     AND available_seats >= $5
     ORDER BY departure_time ASC`,
    [origin, destination, startDate.toISOString(), endDate.toISOString(), passengers]
  );

  return result.rows;
}

/**
 * Helper function to parse date string from MM/DD/YYYY to YYYY-MM-DD
 */
function parseDateString(dateString) {
  const [month, day, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

module.exports = router; 