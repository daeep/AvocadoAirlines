-- Create user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles WHERE rolname = 'avocadoair_user'
    ) THEN
        CREATE USER avocadoair_user WITH PASSWORD 'avocadoair_password';
    END IF;
END
$$;

-- Grant privileges to user
ALTER USER avocadoair_user WITH SUPERUSER;

-- Create tables
CREATE TABLE IF NOT EXISTS user_sessions (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    ip VARCHAR(45) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    count INTEGER DEFAULT 1,
    reset_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 hour'),
    UNIQUE(ip, endpoint)
);

-- Create users table (single definition)
CREATE TABLE IF NOT EXISTS users (
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

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
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

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  key VARCHAR(255) NOT NULL,
  points INTEGER NOT NULL,
  expire BIGINT NOT NULL,
  PRIMARY KEY (key)
);

-- Create two_factor_auth table
CREATE TABLE IF NOT EXISTS two_factor_auth (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  secret VARCHAR(255) NOT NULL,
  backup_codes TEXT[] NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create flights table
CREATE TABLE IF NOT EXISTS flights (
  id SERIAL PRIMARY KEY,
  flight_number VARCHAR(10) NOT NULL,
  origin VARCHAR(3) NOT NULL,
  destination VARCHAR(3) NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  available_seats INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  outbound_flight_id INTEGER REFERENCES flights(id),
  return_flight_id INTEGER REFERENCES flights(id),
  passengers INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create passenger_details table
CREATE TABLE IF NOT EXISTS passenger_details (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER REFERENCES reservations(id),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality VARCHAR(50) NOT NULL,
  passport_number VARCHAR(50) NOT NULL,
  passport_expiry DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER REFERENCES reservations(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  card_last_four VARCHAR(4),
  transaction_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create airports table
CREATE TABLE IF NOT EXISTS airports (
  id SERIAL PRIMARY KEY,
  code VARCHAR(3) UNIQUE NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create airport_translations table
CREATE TABLE IF NOT EXISTS airport_translations (
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

-- Insert international airports if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'LHR') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('LHR', 51.4700, -0.4543, 'Europe/London');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'CDG') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('CDG', 49.0097, 2.5479, 'Europe/Paris');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'FRA') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('FRA', 50.0379, 8.5622, 'Europe/Berlin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'AMS') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('AMS', 52.3086, 4.7639, 'Europe/Amsterdam');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'DXB') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('DXB', 25.2532, 55.3657, 'Asia/Dubai');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'SIN') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('SIN', 1.3644, 103.9915, 'Asia/Singapore');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'HKG') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('HKG', 22.3080, 113.9185, 'Asia/Hong_Kong');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'NRT') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('NRT', 35.7720, 140.3929, 'Asia/Tokyo');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'ICN') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('ICN', 37.4602, 126.4407, 'Asia/Seoul');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'SYD') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('SYD', -33.9399, 151.1753, 'Australia/Sydney');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'MEL') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('MEL', -37.6733, 144.8433, 'Australia/Melbourne');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'AKL') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('AKL', -37.0081, 174.7910, 'Pacific/Auckland');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'YYZ') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('YYZ', 43.6777, -79.6248, 'America/Toronto');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'YVR') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('YVR', 49.1967, -123.1815, 'America/Vancouver');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'GRU') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('GRU', -23.4356, -46.4731, 'America/Sao_Paulo');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'MEX') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('MEX', 19.4363, -99.0721, 'America/Mexico_City');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM airports WHERE code = 'CUN') THEN
        INSERT INTO airports (code, latitude, longitude, timezone) VALUES
        ('CUN', 21.0365, -86.8771, 'America/Cancun');
    END IF;
END $$;

-- Insert airport translations (English) if they don't exist
DO $$
DECLARE
    airport_id_var INTEGER;
BEGIN
    -- LHR (London)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'LHR';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Heathrow Airport', 'London', 'United Kingdom');
    END IF;
    
    -- CDG (Paris)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'CDG';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Charles de Gaulle Airport', 'Paris', 'France');
    END IF;
    
    -- FRA (Frankfurt)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'FRA';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Frankfurt Airport', 'Frankfurt', 'Germany');
    END IF;
    
    -- AMS (Amsterdam)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'AMS';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Amsterdam Airport Schiphol', 'Amsterdam', 'Netherlands');
    END IF;
    
    -- DXB (Dubai)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'DXB';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Dubai International Airport', 'Dubai', 'United Arab Emirates');
    END IF;
    
    -- SIN (Singapore)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'SIN';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Singapore Changi Airport', 'Singapore', 'Singapore');
    END IF;
    
    -- HKG (Hong Kong)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'HKG';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Hong Kong International Airport', 'Hong Kong', 'China');
    END IF;
    
    -- NRT (Tokyo)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'NRT';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Narita International Airport', 'Tokyo', 'Japan');
    END IF;
    
    -- ICN (Seoul)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'ICN';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Incheon International Airport', 'Seoul', 'South Korea');
    END IF;
    
    -- SYD (Sydney)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'SYD';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Sydney Kingsford Smith Airport', 'Sydney', 'Australia');
    END IF;
    
    -- MEL (Melbourne)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'MEL';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Melbourne Airport', 'Melbourne', 'Australia');
    END IF;
    
    -- AKL (Auckland)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'AKL';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Auckland International Airport', 'Auckland', 'New Zealand');
    END IF;
    
    -- YYZ (Toronto)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'YYZ';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Toronto Pearson International Airport', 'Toronto', 'Canada');
    END IF;
    
    -- YVR (Vancouver)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'YVR';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Vancouver International Airport', 'Vancouver', 'Canada');
    END IF;
    
    -- GRU (São Paulo)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'GRU';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'São Paulo Guarulhos International Airport', 'São Paulo', 'Brazil');
    END IF;
    
    -- MEX (Mexico City)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'MEX';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Mexico City International Airport', 'Mexico City', 'Mexico');
    END IF;
    
    -- CUN (Cancun)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'CUN';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'en') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'en', 'Cancun International Airport', 'Cancun', 'Mexico');
    END IF;
END $$;

-- Insert sample flights for the next two weeks
DO $$
DECLARE
    start_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + INTERVAL '14 days';
    current_date DATE;
    flight_date TIMESTAMP;
    base_price DECIMAL;
    discounted_price DECIMAL;
BEGIN
    -- Only insert sample flights if there are no flights in the database
    IF NOT EXISTS (SELECT 1 FROM flights LIMIT 1) THEN
        -- Loop through each day
        FOR current_date IN SELECT generate_series(start_date, end_date, '1 day'::interval)::date LOOP
            -- Morning flights (usually more expensive)
            flight_date := current_date + INTERVAL '8 hours';
            
            -- LHR (London) to CDG (Paris)
            base_price := 200 + (random() * 100);
            discounted_price := base_price * (0.7 + (random() * 0.2)); -- 10-30% discount
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats)
            VALUES (
                'AA' || (1000 + floor(random() * 1000))::text,
                'LHR', 'CDG',
                flight_date,
                flight_date + INTERVAL '1 hour 30 minutes',
                round(discounted_price::numeric, 2),
                50 + floor(random() * 100)
            );

            -- CDG (Paris) to FRA (Frankfurt)
            base_price := 180 + (random() * 80);
            discounted_price := base_price * (0.75 + (random() * 0.15)); -- 10-25% discount
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats)
            VALUES (
                'AA' || (2000 + floor(random() * 1000))::text,
                'CDG', 'FRA',
                flight_date + INTERVAL '2 hours',
                flight_date + INTERVAL '3 hours 30 minutes',
                round(discounted_price::numeric, 2),
                40 + floor(random() * 80)
            );

            -- Evening flights (usually cheaper)
            flight_date := current_date + INTERVAL '18 hours';

            -- AMS (Amsterdam) to LHR (London)
            base_price := 160 + (random() * 70);
            discounted_price := base_price * (0.6 + (random() * 0.2)); -- 20-40% discount
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats)
            VALUES (
                'AA' || (3000 + floor(random() * 1000))::text,
                'AMS', 'LHR',
                flight_date,
                flight_date + INTERVAL '1 hour 15 minutes',
                round(discounted_price::numeric, 2),
                30 + floor(random() * 100)
            );

            -- FRA (Frankfurt) to AMS (Amsterdam)
            base_price := 150 + (random() * 60);
            discounted_price := base_price * (0.65 + (random() * 0.15)); -- 20-35% discount
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats)
            VALUES (
                'AA' || (4000 + floor(random() * 1000))::text,
                'FRA', 'AMS',
                flight_date + INTERVAL '1 hour',
                flight_date + INTERVAL '2 hours 15 minutes',
                round(discounted_price::numeric, 2),
                35 + floor(random() * 90)
            );

            -- MEX (Mexico City) to CUN (Cancun)
            base_price := 150 + (random() * 70);
            discounted_price := base_price * (0.65 + (random() * 0.25)); -- 10-35% discount
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats)
            VALUES (
                'AA' || (7000 + floor(random() * 1000))::text,
                'MEX', 'CUN',
                flight_date + INTERVAL '9 hours',
                flight_date + INTERVAL '11 hours',
                round(discounted_price::numeric, 2),
                35 + floor(random() * 90)
            );

            -- CUN (Cancun) to MEX (Mexico City)
            base_price := 150 + (random() * 70);
            discounted_price := base_price * (0.65 + (random() * 0.25)); -- 10-35% discount
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats)
            VALUES (
                'AA' || (7100 + floor(random() * 1000))::text,
                'CUN', 'MEX',
                flight_date + INTERVAL '14 hours',
                flight_date + INTERVAL '16 hours',
                round(discounted_price::numeric, 2),
                35 + floor(random() * 90)
            );

            -- MEX (Mexico City) to JFK (New York)
            base_price := 450 + (random() * 150);
            discounted_price := base_price * (0.7 + (random() * 0.2)); -- 10-30% discount
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats)
            VALUES (
                'AA' || (7200 + floor(random() * 1000))::text,
                'MEX', 'JFK',
                flight_date + INTERVAL '7 hours',
                flight_date + INTERVAL '12 hours 30 minutes',
                round(discounted_price::numeric, 2),
                45 + floor(random() * 80)
            );

            -- JFK (New York) to CUN (Cancun)
            base_price := 380 + (random() * 120);
            discounted_price := base_price * (0.7 + (random() * 0.2)); -- 10-30% discount
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats)
            VALUES (
                'AA' || (7300 + floor(random() * 1000))::text,
                'JFK', 'CUN',
                flight_date + INTERVAL '10 hours',
                flight_date + INTERVAL '14 hours',
                round(discounted_price::numeric, 2),
                40 + floor(random() * 85)
            );

            -- CUN (Cancun) to LAX (Los Angeles)
            base_price := 400 + (random() * 130);
            discounted_price := base_price * (0.7 + (random() * 0.2)); -- 10-30% discount
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats)
            VALUES (
                'AA' || (7400 + floor(random() * 1000))::text,
                'CUN', 'LAX',
                flight_date + INTERVAL '11 hours',
                flight_date + INTERVAL '15 hours 30 minutes',
                round(discounted_price::numeric, 2),
                38 + floor(random() * 87)
            );
        END LOOP;
    END IF;
END $$;

-- Create admin user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        INSERT INTO users (username, email, password_hash, first_name, last_name)
        VALUES ('admin', 'admin@avocadoair.com', '$2b$10$Y6K/PahQY8iMwxgsnV/nXebqme1gRtTqHA5/UrNy.eHRYuZRAxx26', 'Admin', 'User');
    END IF;
END $$;

-- Create 50 test users if they don't exist
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..50 LOOP
        IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'testuser' || i) THEN
            INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES (
                'testuser' || i,
                'testuser' || i || '@example.com',
                '$2b$10$82wGgFIX8ef9uh90tZEiUuBhJEikNMOQulwqQyh/6sL0cTOigFhU2',
                'Test',
                'User' || i
            );
        END IF;
    END LOOP;
END $$;

-- Spanish translations for Mexican airports
DO $$
DECLARE
    airport_id_var INTEGER;
BEGIN
    -- MEX (Mexico City)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'MEX';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'es') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'es', 'Aeropuerto Internacional de la Ciudad de México', 'Ciudad de México', 'México');
    END IF;
    
    -- CUN (Cancun)
    SELECT id INTO airport_id_var FROM airports WHERE code = 'CUN';
    IF NOT EXISTS (SELECT 1 FROM airport_translations WHERE airport_id = airport_id_var AND language_code = 'es') THEN
        INSERT INTO airport_translations (airport_id, language_code, name, city, country) VALUES
        (airport_id_var, 'es', 'Aeropuerto Internacional de Cancún', 'Cancún', 'México');
    END IF;
END $$; 