-- Update script to add missing columns to existing database

-- Add payment_status column to reservations table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE reservations ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid';
    END IF;
END $$;

-- Add card_last_four column to payments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'card_last_four'
    ) THEN
        ALTER TABLE payments ADD COLUMN card_last_four VARCHAR(4);
    END IF;
END $$;

-- Update user_sessions table structure if needed
DO $$
BEGIN
    -- Check if the old structure exists (has 'sid' column)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'sid'
    ) THEN
        -- Drop the old table and create the new one
        DROP TABLE user_sessions;
        
        CREATE TABLE user_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            token VARCHAR(255) NOT NULL,
            ip_address VARCHAR(50),
            user_agent TEXT,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_valid BOOLEAN DEFAULT TRUE
        );
    END IF;
END $$;

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'Database update completed successfully.';
END $$;

-- This script runs after init.sql and ensures all tables are properly created
-- It will be executed every time the container starts

-- Check if tables exist and create them if they don't
DO $$
BEGIN
    -- Check if users table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Check if user_sessions table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_sessions') THEN
        CREATE TABLE user_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            token VARCHAR(255) NOT NULL,
            ip_address VARCHAR(50),
            user_agent TEXT,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_valid BOOLEAN DEFAULT TRUE
        );
    END IF;

    -- Check if rate_limits table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rate_limits') THEN
        CREATE TABLE rate_limits (
            id SERIAL PRIMARY KEY,
            ip VARCHAR(45) NOT NULL,
            endpoint VARCHAR(100) NOT NULL,
            count INTEGER DEFAULT 1,
            reset_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 hour'),
            UNIQUE(ip, endpoint)
        );
    END IF;

    -- Check if two_factor_auth table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'two_factor_auth') THEN
        CREATE TABLE two_factor_auth (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            secret VARCHAR(100) NOT NULL,
            enabled BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Check if flights table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'flights') THEN
        CREATE TABLE flights (
            id SERIAL PRIMARY KEY,
            flight_number VARCHAR(10) NOT NULL,
            origin VARCHAR(3) NOT NULL,
            destination VARCHAR(3) NOT NULL,
            departure_time TIMESTAMP NOT NULL,
            arrival_time TIMESTAMP NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            available_seats INTEGER NOT NULL,
            total_seats INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Check if reservations table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reservations') THEN
        CREATE TABLE reservations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            outbound_flight_id INTEGER REFERENCES flights(id) ON DELETE SET NULL,
            return_flight_id INTEGER REFERENCES flights(id) ON DELETE SET NULL,
            status VARCHAR(20) DEFAULT 'pending',
            total_price DECIMAL(10, 2) NOT NULL,
            booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Check if passenger_details table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'passenger_details') THEN
        CREATE TABLE passenger_details (
            id SERIAL PRIMARY KEY,
            reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            date_of_birth DATE,
            passport_number VARCHAR(20),
            nationality VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Check if payments table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
        CREATE TABLE payments (
            id SERIAL PRIMARY KEY,
            reservation_id INTEGER REFERENCES reservations(id) ON DELETE SET NULL,
            amount DECIMAL(10, 2) NOT NULL,
            payment_method VARCHAR(20) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            transaction_id VARCHAR(100),
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Check if airports table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'airports') THEN
        CREATE TABLE airports (
            id SERIAL PRIMARY KEY,
            code VARCHAR(3) UNIQUE NOT NULL,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            timezone VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Check if airport_translations table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'airport_translations') THEN
        CREATE TABLE airport_translations (
            id SERIAL PRIMARY KEY,
            airport_id INTEGER REFERENCES airports(id) ON DELETE CASCADE,
            language_code VARCHAR(5) NOT NULL,
            name VARCHAR(100) NOT NULL,
            city VARCHAR(100) NOT NULL,
            country VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(airport_id, language_code)
        );
    END IF;

    -- Check if additional tables need to be created
    -- (none for now, but this is where you would add them)
END $$; 