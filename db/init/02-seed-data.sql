-- Insert sample flight data
INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats, total_seats) VALUES
('AA101', 'LAX', 'JFK', '2023-12-01 08:00:00+00', '2023-12-01 16:30:00+00', 299.99, 150, 180),
('AA102', 'JFK', 'LAX', '2023-12-01 10:00:00+00', '2023-12-01 13:30:00+00', 349.99, 120, 180),
('AA103', 'SFO', 'ORD', '2023-12-01 09:15:00+00', '2023-12-01 15:45:00+00', 199.99, 100, 150),
('AA104', 'ORD', 'SFO', '2023-12-01 11:30:00+00', '2023-12-01 14:00:00+00', 249.99, 95, 150),
('AA105', 'DFW', 'MIA', '2023-12-01 07:45:00+00', '2023-12-01 11:15:00+00', 179.99, 85, 120),
('AA106', 'MIA', 'DFW', '2023-12-01 12:30:00+00', '2023-12-01 15:00:00+00', 189.99, 90, 120),
('AA107', 'SEA', 'DEN', '2023-12-01 08:30:00+00', '2023-12-01 12:00:00+00', 159.99, 110, 150),
('AA108', 'DEN', 'SEA', '2023-12-01 13:15:00+00', '2023-12-01 15:45:00+00', 149.99, 105, 150),
('AA109', 'ATL', 'BOS', '2023-12-01 09:00:00+00', '2023-12-01 11:30:00+00', 219.99, 140, 180),
('AA110', 'BOS', 'ATL', '2023-12-01 13:45:00+00', '2023-12-01 16:15:00+00', 229.99, 135, 180);

-- Insert same flights for the next day
INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats, total_seats) VALUES
('AA201', 'LAX', 'JFK', '2023-12-02 08:00:00+00', '2023-12-02 16:30:00+00', 319.99, 150, 180),
('AA202', 'JFK', 'LAX', '2023-12-02 10:00:00+00', '2023-12-02 13:30:00+00', 369.99, 120, 180),
('AA203', 'SFO', 'ORD', '2023-12-02 09:15:00+00', '2023-12-02 15:45:00+00', 209.99, 100, 150),
('AA204', 'ORD', 'SFO', '2023-12-02 11:30:00+00', '2023-12-02 14:00:00+00', 259.99, 95, 150),
('AA205', 'DFW', 'MIA', '2023-12-02 07:45:00+00', '2023-12-02 11:15:00+00', 189.99, 85, 120),
('AA206', 'MIA', 'DFW', '2023-12-02 12:30:00+00', '2023-12-02 15:00:00+00', 199.99, 90, 120),
('AA207', 'SEA', 'DEN', '2023-12-02 08:30:00+00', '2023-12-02 12:00:00+00', 169.99, 110, 150),
('AA208', 'DEN', 'SEA', '2023-12-02 13:15:00+00', '2023-12-02 15:45:00+00', 159.99, 105, 150),
('AA209', 'ATL', 'BOS', '2023-12-02 09:00:00+00', '2023-12-02 11:30:00+00', 229.99, 140, 180),
('AA210', 'BOS', 'ATL', '2023-12-02 13:45:00+00', '2023-12-02 16:15:00+00', 239.99, 135, 180);

-- Create admin user (password is 'admin123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('admin', 'admin@avocadoair.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Admin', 'User');

-- Insert 50 random test users (password is 'password123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('jsmith', 'john.smith@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'John', 'Smith'),
('mjohnson', 'mary.johnson@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Mary', 'Johnson'),
('rwilliams', 'robert.williams@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Robert', 'Williams'),
('jbrown', 'jennifer.brown@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Jennifer', 'Brown'),
('mjones', 'michael.jones@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Michael', 'Jones'),
('lgarcia', 'linda.garcia@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Linda', 'Garcia'),
('dmiller', 'david.miller@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'David', 'Miller'),
('pdavis', 'patricia.davis@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Patricia', 'Davis'),
('jrodriguez', 'james.rodriguez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'James', 'Rodriguez'),
('mmartinez', 'maria.martinez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Maria', 'Martinez'),
('chernandez', 'charles.hernandez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Charles', 'Hernandez'),
('slopez', 'sarah.lopez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Sarah', 'Lopez'),
('tgonzalez', 'thomas.gonzalez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Thomas', 'Gonzalez'),
('jwilson', 'jessica.wilson@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Jessica', 'Wilson'),
('danderson', 'daniel.anderson@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Daniel', 'Anderson'),
('ltaylor', 'lisa.taylor@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Lisa', 'Taylor'),
('mthomas', 'mark.thomas@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Mark', 'Thomas'),
('bmoore', 'betty.moore@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Betty', 'Moore'),
('pmartin', 'paul.martin@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Paul', 'Martin'),
('nlee', 'nancy.lee@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Nancy', 'Lee'),
('athompson', 'anthony.thompson@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Anthony', 'Thompson'),
('ewhite', 'elizabeth.white@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Elizabeth', 'White'),
('rharris', 'richard.harris@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Richard', 'Harris'),
('ssanchez', 'sandra.sanchez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Sandra', 'Sanchez'),
('kclark', 'kevin.clark@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Kevin', 'Clark'),
('dramirez', 'donna.ramirez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Donna', 'Ramirez'),
('jlewis', 'joseph.lewis@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Joseph', 'Lewis'),
('krobinson', 'kimberly.robinson@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Kimberly', 'Robinson'),
('cwalker', 'charles.walker@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Charles', 'Walker'),
('mperez', 'michelle.perez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Michelle', 'Perez'),
('shall', 'steven.hall@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Steven', 'Hall'),
('syoung', 'susan.young@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Susan', 'Young'),
('rking', 'robert.king@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Robert', 'King'),
('cwright', 'carol.wright@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Carol', 'Wright'),
('rlopez', 'ronald.lopez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Ronald', 'Lopez'),
('ahill', 'amanda.hill@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Amanda', 'Hill'),
('sscott', 'scott.scott@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Scott', 'Scott'),
('mgreen', 'melissa.green@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Melissa', 'Green'),
('jadams', 'jeffrey.adams@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Jeffrey', 'Adams'),
('pbaker', 'pamela.baker@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Pamela', 'Baker'),
('jgonzalez', 'jose.gonzalez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Jose', 'Gonzalez'),
('cnelson', 'christine.nelson@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Christine', 'Nelson'),
('ecarter', 'edward.carter@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Edward', 'Carter'),
('lmitchell', 'laura.mitchell@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Laura', 'Mitchell'),
('dperez', 'donald.perez@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Donald', 'Perez'),
('aroberts', 'amy.roberts@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Amy', 'Roberts'),
('sturner', 'steven.turner@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Steven', 'Turner'),
('dphillips', 'diane.phillips@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Diane', 'Phillips');

-- Create test user (password is 'password123')
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('testuser1', 'testuser1@example.com', '$2b$10$ViQlZroyOIoSBFb0dP8FfeE9piPItIOEQvGQh18qE1py/qfWGZ7Ne', 'Test', 'User'); 