-- Update database schema to match the original Flask application structure

-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS classes;

-- Create users table matching the original Flask schema
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0
);

-- Create bookings table matching the original Flask schema
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    class_type TEXT NOT NULL,
    date TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance table matching the original Flask schema
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    class_type TEXT NOT NULL,
    date TEXT NOT NULL,
    attended INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Insert the admin user with the original password hash
INSERT OR IGNORE INTO users (username, password, is_admin) 
VALUES ('admin', 'scrypt:32768:8:1$QqDph6WwUQtMQwdN$a58b73d93eb48c2de21ae9f27914c3146a0d5e26193e79f1063f0d111047c1cceda101e6258d8f6d49ebbb397fdbe9c1838da63ea45b83b401a02f914d1788f7', 1);

-- Add some sample data for testing
INSERT OR IGNORE INTO users (username, password, is_admin) VALUES
('john_doe', 'password123', 0),
('jane_smith', 'password123', 0),
('mike_wilson', 'password123', 0);

-- Add sample bookings
INSERT OR IGNORE INTO bookings (name, email, class_type, date) VALUES
('John Doe', 'john@example.com', 'Boxing', '2024-01-25'),
('Jane Smith', 'jane@example.com', 'Strength & Conditioning', '2024-01-26'),
('Mike Wilson', 'mike@example.com', 'Junior Jabbers', '2024-01-27');

-- Add sample attendance records
INSERT OR IGNORE INTO attendance (user_id, class_type, date, attended) VALUES
(2, 'Boxing', '2024-01-25', 1),
(3, 'Strength & Conditioning', '2024-01-26', 0),
(4, 'Junior Jabbers', '2024-01-27', 1);
