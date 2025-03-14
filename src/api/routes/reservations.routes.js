const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../utils/db');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth.middleware');
const { luhnCheck, isValidExpirationDate } = require('../utils/validators');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the reservation
 *         user_id:
 *           type: integer
 *           description: ID of the user who made the reservation
 *         flight_id:
 *           type: integer
 *           description: ID of the flight being reserved
 *         seat_number:
 *           type: string
 *           description: Assigned seat number
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *           description: Current status of the reservation
 *         payment_status:
 *           type: string
 *           enum: [unpaid, paid, refunded]
 *           description: Payment status of the reservation
 *         total_price:
 *           type: number
 *           format: float
 *           description: Total cost of the reservation
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Time the reservation was created
 *       example:
 *         id: 1
 *         user_id: 2
 *         flight_id: 5
 *         status: "confirmed"
 *         payment_status: "paid"
 *         total_price: 299.99
 *         created_at: "2023-05-15T08:44:12.000Z"
 */

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flightId
 *               - passengers
 *             properties:
 *               flightId:
 *                 type: integer
 *                 description: ID of the flight to reserve
 *               passengers:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 9
 *                 description: Number of passengers (1-9)
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reservation created successfully"
 *                 reservationId:
 *                   type: integer
 *                   example: 1
 *                 totalPrice:
 *                   type: number
 *                   example: 599.98
 *       400:
 *         description: Invalid input or not enough seats available
 *       404:
 *         description: Flight not found
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authMiddleware,
  [
    // Validation
    body('flightId').isInt().withMessage('Valid flight ID is required'),
    body('passengers').isInt({ min: 1, max: 9 }).withMessage('Passengers must be between 1 and 9')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { flightId, passengers } = req.body;

    try {
      // Get flight details
      const flightResult = await db.query(
        'SELECT * FROM flights WHERE id = $1',
        [flightId]
      );

      if (flightResult.rows.length === 0) {
        return res.status(404).json({ message: 'Flight not found' });
      }

      const flight = flightResult.rows[0];

      // Check seat availability
      if (flight.available_seats < passengers) {
        return res.status(400).json({ message: 'Not enough seats available' });
      }

      // Start transaction for reservation creation
      const client = await db.pool.connect();

      try {
        await client.query('BEGIN');

        // Calculate total price
        const totalPrice = flight.price * passengers;

        // Create reservation
        const reservationResult = await client.query(
          `INSERT INTO reservations 
           (user_id, outbound_flight_id, passengers, total_price, status) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING id`,
          [req.user.id, flightId, passengers, totalPrice, 'pending']
        );

        const reservationId = reservationResult.rows[0].id;

        // Update flight available seats
        await client.query(
          'UPDATE flights SET available_seats = available_seats - $1 WHERE id = $2',
          [passengers, flightId]
        );

        await client.query('COMMIT');

        res.status(201).json({
          message: 'Reservation created successfully',
          reservationId,
          totalPrice
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      logger.error('Reservation creation error', { error: err.message });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /reservations/{id}/payment:
 *   post:
 *     summary: Process payment for a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardNumber
 *               - expirationDate
 *               - cvv
 *               - firstName
 *               - lastName
 *               - address
 *               - cityStateZip
 *             properties:
 *               cardNumber:
 *                 type: string
 *                 description: Credit card number (with or without dashes)
 *                 example: "4111-1111-1111-1111"
 *               expirationDate:
 *                 type: string
 *                 description: Card expiration date (MM/YY)
 *                 example: "12/25"
 *               cvv:
 *                 type: string
 *                 description: Card verification value (3-4 digits)
 *                 example: "123"
 *               firstName:
 *                 type: string
 *                 description: Cardholder's first name
 *               lastName:
 *                 type: string
 *                 description: Cardholder's last name
 *               address:
 *                 type: string
 *                 description: Billing address
 *               cityStateZip:
 *                 type: string
 *                 description: City, state, and zip code
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment processed successfully"
 *                 reservationId:
 *                   type: integer
 *                   example: 1
 *                 transactionId:
 *                   type: string
 *                   example: "TR1620489253123"
 *                 status:
 *                   type: string
 *                   example: "confirmed"
 *       400:
 *         description: Invalid input or payment already processed
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:id/payment',
  authMiddleware,
  [
    // Validation
    body('cardNumber').custom(value => {
      // Remove dashes for validation
      const cleanedValue = value.replace(/-/g, '');
      if (!luhnCheck(cleanedValue)) {
        throw new Error('Invalid credit card number');
      }
      return true;
    }),
    body('expirationDate').custom(value => {
      if (!isValidExpirationDate(value)) {
        throw new Error('Invalid or expired card');
      }
      return true;
    }),
    body('cvv').isLength({ min: 3, max: 4 }).withMessage('CVV must be 3-4 digits'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('cityStateZip').notEmpty().withMessage('City/State/Zip is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      cardNumber, 
      expirationDate,
      firstName, 
      lastName, 
      address, 
      cityStateZip 
    } = req.body;
    const reservationId = req.params.id;

    try {
      // Check if reservation exists and belongs to user
      const reservationResult = await db.query(
        'SELECT * FROM reservations WHERE id = $1 AND user_id = $2',
        [reservationId, req.user.id]
      );

      if (reservationResult.rows.length === 0) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      const reservation = reservationResult.rows[0];

      // Check if payment is already processed
      if (reservation.payment_status === 'paid') {
        return res.status(400).json({ message: 'Payment already processed' });
      }

      // Get last 4 digits of card
      const cardLastFour = cardNumber.replace(/\D/g, '').slice(-4);

      // Generate transaction ID
      const transactionId = 'TR' + Date.now() + Math.floor(Math.random() * 1000);

      // Start transaction for payment processing
      const client = await db.pool.connect();

      try {
        await client.query('BEGIN');

        // Record payment
        await client.query(
          `INSERT INTO payments 
           (reservation_id, amount, payment_method, card_last_four, transaction_id, status) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [reservationId, reservation.total_price, 'credit_card', cardLastFour, transactionId, 'completed']
        );

        // Update reservation status
        await client.query(
          'UPDATE reservations SET status = $1, payment_status = $2 WHERE id = $3',
          ['confirmed', 'paid', reservationId]
        );

        await client.query('COMMIT');

        res.json({
          message: 'Payment processed successfully',
          reservationId,
          transactionId,
          status: 'confirmed'
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      logger.error('Payment processing error', { error: err.message });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Get all user reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // First, check if the user has any reservations
    const userCheck = await db.query(
      `SELECT COUNT(*) FROM reservations WHERE user_id = $1`,
      [req.user.id]
    );
    
    // If no reservations, return empty array
    if (userCheck.rows[0].count === '0') {
      return res.json([]);
    }
    
    // Get the column names from the reservations table
    const columnsResult = await db.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'reservations'`
    );
    
    // Log the available columns for debugging
    const columns = columnsResult.rows.map(row => row.column_name);
    logger.info('Available columns in reservations table', { columns });
    
    // Check if outbound_flight_id exists
    const hasOutboundFlightId = columns.includes('outbound_flight_id');
    const flightIdColumn = hasOutboundFlightId ? 'outbound_flight_id' : 'flight_id';
    
    // Construct a query based on the available columns
    const query = `
      SELECT r.*, 
             f.flight_number, 
             f.origin, 
             f.destination, 
             f.departure_time, 
             f.arrival_time
      FROM reservations r
      JOIN flights f ON r.${flightIdColumn} = f.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    
    logger.info('Executing reservations query', { query });
    const result = await db.query(query, [req.user.id]);
    
    // Transform the result to match the expected format
    const reservations = result.rows.map(row => {
      // Create a standardized reservation object
      return {
        id: row.id,
        confirmationNumber: row.id.toString().padStart(6, '0'),
        bookingDate: row.created_at,
        status: row.status.toUpperCase(),
        totalPrice: parseFloat(row.total_price),
        outboundFlight: {
          flightNumber: row.flight_number,
          origin: row.origin,
          destination: row.destination,
          departureTime: row.departure_time,
          arrivalTime: row.arrival_time
        },
        // Include return flight if available
        returnFlight: row.return_flight_id ? {
          // This would need to be populated with a separate query
          // For now, we'll return null
          flightNumber: null,
          origin: null,
          destination: null,
          departureTime: null,
          arrivalTime: null
        } : null,
        // Mock passengers data since we don't have it yet
        passengers: [
          {
            firstName: "Passenger",
            lastName: "Name",
            passportNumber: "XXXXXXXX"
          }
        ]
      };
    });
    
    res.json(reservations);
  } catch (err) {
    logger.error('Reservations fetch error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Get reservation details by ID
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Get the column names from the reservations table
    const columnsResult = await db.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'reservations'`
    );
    
    // Log the available columns for debugging
    const columns = columnsResult.rows.map(row => row.column_name);
    logger.info('Available columns in reservations table', { columns });
    
    // Check if outbound_flight_id exists
    const hasOutboundFlightId = columns.includes('outbound_flight_id');
    const flightIdColumn = hasOutboundFlightId ? 'outbound_flight_id' : 'flight_id';
    
    // Check if the payments table has the expected columns
    const paymentsColumnsResult = await db.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'payments'`
    );
    
    const paymentsColumns = paymentsColumnsResult.rows.map(row => row.column_name);
    logger.info('Available columns in payments table', { paymentsColumns });
    
    // Construct the query based on available columns
    let query = `
      SELECT r.*, f.flight_number, f.origin, f.destination, f.departure_time, f.arrival_time
      FROM reservations r
      JOIN flights f ON r.${flightIdColumn} = f.id
    `;
    
    // Only join with payments table if it exists
    if (paymentsColumns.length > 0) {
      // Add payment fields that exist
      let paymentFields = [];
      if (paymentsColumns.includes('transaction_id')) paymentFields.push('p.transaction_id');
      if (paymentsColumns.includes('status')) paymentFields.push('p.status as payment_status');
      
      // Add the LEFT JOIN only if we have payment fields to select
      if (paymentFields.length > 0) {
        query += `
          LEFT JOIN payments p ON p.reservation_id = r.id
        `;
      }
    }
    
    // Add the WHERE clause
    query += `
      WHERE r.id = $1 AND r.user_id = $2
    `;
    
    logger.info('Executing reservation query', { query });
    const result = await db.query(query, [req.params.id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Reservation fetch error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: Cancel a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reservation cancelled successfully"
 *       400:
 *         description: Reservation already cancelled
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const reservationId = req.params.id;

  try {
    // Get reservation details
    const reservationResult = await db.query(
      'SELECT * FROM reservations WHERE id = $1 AND user_id = $2',
      [reservationId, req.user.id]
    );

    if (reservationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const reservation = reservationResult.rows[0];

    // Can't cancel if already cancelled
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'Reservation already cancelled' });
    }

    // Start transaction
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Update reservation status
      await client.query(
        'UPDATE reservations SET status = $1 WHERE id = $2',
        ['cancelled', reservationId]
      );

      // Return seats to available inventory - use the actual number of passengers
      await client.query(
        'UPDATE flights SET available_seats = available_seats + $1 WHERE id = $2',
        [reservation.passengers, reservation.outbound_flight_id]
      );

      await client.query('COMMIT');

      res.json({ message: 'Reservation cancelled successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error('Reservation cancellation error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 