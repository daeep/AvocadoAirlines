const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AvocadoAir API',
    version: '1.0.0',
    description: 'RESTful API for the AvocadoAir flight booking application',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'API Support',
      email: 'support@avocadoair.com',
      url: 'https://avocadoair.com/support'
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
    {
      url: 'http://avocadoair-api:3000/api',
      description: 'Docker development server',
    },
    {
      url: 'https://api.avocadoair.com/api',
      description: 'Production server',
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      // User schema
      User: {
        type: 'object',
        required: ['username', 'email', 'firstName', 'lastName'],
        properties: {
          id: {
            type: 'integer',
            description: 'The auto-generated ID of the user',
            example: 1
          },
          username: {
            type: 'string',
            description: 'Unique username for login',
            maxLength: 50,
            example: 'johndoe'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Unique email address of the user',
            maxLength: 100,
            example: 'john.doe@example.com'
          },
          firstName: {
            type: 'string',
            description: "User's first name",
            maxLength: 50,
            example: 'John'
          },
          lastName: {
            type: 'string',
            description: "User's last name",
            maxLength: 50,
            example: 'Doe'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time when the user was created',
            example: '2023-01-15T08:30:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time when the user was last updated',
            example: '2023-01-15T08:30:00Z'
          }
        }
      },
      // Flight schema
      Flight: {
        type: 'object',
        required: ['flightNumber', 'origin', 'destination', 'departureTime', 'arrivalTime', 'price', 'availableSeats', 'totalSeats'],
        properties: {
          id: {
            type: 'integer',
            description: 'The auto-generated ID of the flight',
            example: 1
          },
          flightNumber: {
            type: 'string',
            description: 'Unique flight number',
            maxLength: 10,
            example: 'AA101'
          },
          origin: {
            type: 'string',
            description: 'Origin airport code (IATA)',
            maxLength: 3,
            minLength: 3,
            example: 'LAX'
          },
          destination: {
            type: 'string',
            description: 'Destination airport code (IATA)',
            maxLength: 3,
            minLength: 3,
            example: 'JFK'
          },
          departureTime: {
            type: 'string',
            format: 'date-time',
            description: 'Scheduled departure time',
            example: '2023-12-01T08:00:00Z'
          },
          arrivalTime: {
            type: 'string',
            format: 'date-time',
            description: 'Scheduled arrival time',
            example: '2023-12-01T16:30:00Z'
          },
          price: {
            type: 'number',
            format: 'decimal',
            description: 'Flight price per passenger',
            minimum: 0,
            maximum: 9999999.99,
            example: 299.99
          },
          availableSeats: {
            type: 'integer',
            description: 'Number of seats currently available',
            minimum: 0,
            example: 150
          },
          totalSeats: {
            type: 'integer',
            description: 'Total number of seats on the flight',
            minimum: 1,
            example: 180
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time when the flight was created',
            example: '2023-01-15T08:30:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time when the flight was last updated',
            example: '2023-01-15T08:30:00Z'
          }
        }
      },
      // Reservation schema
      Reservation: {
        type: 'object',
        required: ['userId', 'flightId', 'status', 'paymentStatus', 'totalPrice'],
        properties: {
          id: {
            type: 'integer',
            description: 'The auto-generated ID of the reservation',
            example: 1
          },
          userId: {
            type: 'integer',
            description: 'ID of the user who made the reservation',
            example: 2
          },
          flightId: {
            type: 'integer',
            description: 'ID of the flight being reserved',
            example: 5
          },
          seatNumber: {
            type: 'string',
            description: 'Assigned seat number',
            maxLength: 10,
            example: '12A'
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled'],
            description: 'Current status of the reservation',
            maxLength: 20,
            example: 'confirmed'
          },
          paymentStatus: {
            type: 'string',
            enum: ['unpaid', 'paid', 'refunded'],
            description: 'Payment status of the reservation',
            maxLength: 20,
            example: 'paid'
          },
          totalPrice: {
            type: 'number',
            format: 'decimal',
            description: 'Total cost of the reservation',
            minimum: 0,
            maximum: 9999999.99,
            example: 299.99
          },
          passengers: {
            type: 'integer',
            description: 'Number of passengers included in this reservation',
            minimum: 1,
            maximum: 9,
            example: 2
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time when the reservation was created',
            example: '2023-05-15T08:44:12Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time when the reservation was last updated',
            example: '2023-05-15T08:44:12Z'
          }
        }
      },
      // Payment schema
      Payment: {
        type: 'object',
        required: ['reservationId', 'amount', 'paymentMethod', 'status'],
        properties: {
          id: {
            type: 'integer',
            description: 'The auto-generated ID of the payment',
            example: 1
          },
          reservationId: {
            type: 'integer',
            description: 'ID of the reservation being paid for',
            example: 5
          },
          amount: {
            type: 'number',
            format: 'decimal',
            description: 'Payment amount',
            minimum: 0,
            maximum: 9999999.99,
            example: 299.99
          },
          paymentMethod: {
            type: 'string',
            description: 'Method of payment',
            maxLength: 50,
            example: 'credit_card'
          },
          cardLastFour: {
            type: 'string',
            description: 'Last four digits of the credit card',
            maxLength: 4,
            example: '1234'
          },
          transactionId: {
            type: 'string',
            description: 'Payment processor transaction ID',
            maxLength: 100,
            example: 'txn_1K2OnjHYgXyZ'
          },
          status: {
            type: 'string',
            enum: ['pending', 'completed', 'failed', 'refunded'],
            description: 'Status of the payment',
            maxLength: 20,
            example: 'completed'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time when the payment was created',
            example: '2023-05-15T08:45:30Z'
          }
        }
      },
      // Itinerary schema
      Itinerary: {
        type: 'object',
        required: ['userId', 'status', 'paymentStatus', 'totalPrice', 'passengerCount'],
        properties: {
          id: {
            type: 'integer',
            description: 'The auto-generated ID of the itinerary',
            example: 1
          },
          userId: {
            type: 'integer',
            description: 'ID of the user who created the itinerary',
            example: 2
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled'],
            description: 'Current status of the itinerary',
            maxLength: 20,
            example: 'confirmed'
          },
          paymentStatus: {
            type: 'string',
            enum: ['unpaid', 'paid', 'refunded'],
            description: 'Payment status of the itinerary',
            maxLength: 20,
            example: 'paid'
          },
          totalPrice: {
            type: 'number',
            format: 'decimal',
            description: 'Total cost of the itinerary',
            minimum: 0,
            maximum: 9999999.99,
            example: 599.98
          },
          passengerCount: {
            type: 'integer',
            description: 'Number of passengers included in this itinerary',
            minimum: 1,
            maximum: 9,
            example: 2
          },
          flights: {
            type: 'array',
            description: 'List of flights in this itinerary',
            items: {
              type: 'object',
              properties: {
                flightId: {
                  type: 'integer',
                  description: 'ID of the flight',
                  example: 5
                },
                sequenceNumber: {
                  type: 'integer',
                  description: 'Order of the flight in the itinerary',
                  example: 1
                },
                seatNumbers: {
                  type: 'array',
                  description: 'Assigned seat numbers',
                  items: {
                    type: 'string',
                    example: '12A'
                  }
                }
              }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time when the itinerary was created',
            example: '2023-05-15T08:44:12Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time when the itinerary was last updated',
            example: '2023-05-15T08:44:12Z'
          }
        }
      },
      // Airport schema
      Airport: {
        type: 'object',
        required: ['code', 'name', 'city', 'country'],
        properties: {
          id: {
            type: 'integer',
            description: 'The auto-generated ID of the airport',
            example: 1
          },
          code: {
            type: 'string',
            description: 'IATA airport code',
            maxLength: 3,
            minLength: 3,
            example: 'LAX'
          },
          name: {
            type: 'string',
            description: 'Full name of the airport',
            example: 'Los Angeles International Airport'
          },
          city: {
            type: 'string',
            description: 'City where the airport is located',
            example: 'Los Angeles'
          },
          country: {
            type: 'string',
            description: 'Country where the airport is located',
            example: 'United States'
          },
          latitude: {
            type: 'number',
            format: 'float',
            description: 'Latitude coordinates',
            example: 33.9425
          },
          longitude: {
            type: 'number',
            format: 'float',
            description: 'Longitude coordinates',
            example: -118.4081
          }
        }
      },
      // Error response
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Invalid input parameters'
          },
          errors: {
            type: 'array',
            description: 'List of validation errors',
            items: {
              type: 'object',
              properties: {
                param: {
                  type: 'string',
                  description: 'Parameter that failed validation',
                  example: 'email'
                },
                msg: {
                  type: 'string',
                  description: 'Error message for this parameter',
                  example: 'Must be a valid email address'
                },
                location: {
                  type: 'string',
                  description: 'Location of the parameter',
                  example: 'body'
                }
              }
            }
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication information is missing or invalid',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Unauthorized access'
                }
              }
            }
          }
        }
      },
      BadRequest: {
        description: 'Invalid input parameters',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      NotFound: {
        description: 'The specified resource was not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Resource not found'
                }
              }
            }
          }
        }
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Server error'
                }
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'API endpoints for user authentication and authorization'
    },
    {
      name: 'Users',
      description: 'API endpoints for user management'
    },
    {
      name: 'Flights',
      description: 'API endpoints for flight search and information'
    },
    {
      name: 'Reservations',
      description: 'API endpoints for managing flight reservations'
    },
    {
      name: 'Payments',
      description: 'API endpoints for processing payments'
    },
    {
      name: 'Itineraries',
      description: 'API endpoints for managing multi-city bookings'
    },
    {
      name: 'Airports',
      description: 'API endpoints for airport information'
    },
    {
      name: 'Health',
      description: 'API endpoints for system health monitoring'
    }
  ]
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/api/routes/*.js'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AvocadoAir API Documentation',
    customfavIcon: '/favicon.ico'
  }),
  spec: swaggerSpec,
}; 