-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    membership_type TEXT DEFAULT 'basic',
    membership_status TEXT DEFAULT 'active',
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    duration INTEGER DEFAULT 60,
    max_capacity INTEGER DEFAULT 20,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create class_instances table
CREATE TABLE IF NOT EXISTS class_instances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    instructor TEXT,
    max_capacity INTEGER DEFAULT 20,
    current_bookings INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Create class_bookings table
CREATE TABLE IF NOT EXISTS class_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    class_instance_id INTEGER NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'confirmed',
    payment_status TEXT DEFAULT 'pending',
    attended INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (class_instance_id) REFERENCES class_instances(id),
    UNIQUE(user_id, class_instance_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type TEXT NOT NULL,
    payment_method TEXT,
    description TEXT,
    status TEXT DEFAULT 'completed',
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Legacy tables for compatibility
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    class_date DATE NOT NULL,
    class_time TIME NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    class_date DATE NOT NULL,
    attended INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert admin user
INSERT OR REPLACE INTO users (id, username, password, email, full_name, is_admin, membership_status) 
VALUES (1, 'admin', 'admin123', 'admin@sweatwithscott.com', 'Admin User', 1, 'admin');

-- Insert sample classes
INSERT OR REPLACE INTO classes (id, name, description, instructor, duration, max_capacity, price) VALUES
(1, 'Boxing Fundamentals', 'Learn the basics of boxing technique and footwork', 'Kyle McLaughlin', 60, 15, 25.00),
(2, 'Strength & Conditioning', 'Build strength and endurance with functional training', 'Humza Ali', 45, 12, 20.00),
(3, 'Junior Jabbers', 'Boxing classes designed specifically for kids aged 8-14', 'Scott Wilson', 45, 10, 15.00),
(4, 'Advanced Boxing', 'High-intensity boxing for experienced fighters', 'Kyle McLaughlin', 75, 12, 30.00),
(5, 'Women''s Boxing', 'Boxing classes in a supportive women-only environment', 'Sarah Johnson', 60, 15, 25.00);

-- Insert sample users
INSERT OR REPLACE INTO users (id, username, password, email, full_name, phone, membership_type, is_admin) VALUES
(2, 'john_doe', 'password123', 'john@example.com', 'John Doe', '555-0101', 'premium', 0),
(3, 'jane_smith', 'password123', 'jane@example.com', 'Jane Smith', '555-0102', 'basic', 0),
(4, 'mike_wilson', 'password123', 'mike@example.com', 'Mike Wilson', '555-0103', 'premium', 0);

-- Generate class instances for the next 30 days
INSERT OR REPLACE INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity) 
SELECT 
    c.id,
    date('now', '+' || (d.day_offset) || ' days') as date,
    CASE 
        WHEN c.id = 1 THEN '09:00' -- Boxing Fundamentals
        WHEN c.id = 2 THEN '18:00' -- Strength & Conditioning
        WHEN c.id = 3 THEN '16:00' -- Junior Jabbers
        WHEN c.id = 4 THEN '19:30' -- Advanced Boxing
        WHEN c.id = 5 THEN '10:00' -- Women's Boxing
    END as start_time,
    CASE 
        WHEN c.id = 1 THEN '10:00'
        WHEN c.id = 2 THEN '18:45'
        WHEN c.id = 3 THEN '16:45'
        WHEN c.id = 4 THEN '20:45'
        WHEN c.id = 5 THEN '11:00'
    END as end_time,
    c.instructor,
    c.max_capacity
FROM classes c
CROSS JOIN (
    SELECT 0 as day_offset UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION
    SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION
    SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
    SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION
    SELECT 28 UNION SELECT 29 UNION SELECT 30
) d
WHERE 
    -- Schedule classes on specific days
    (c.id = 1 AND CAST(strftime('%w', date('now', '+' || d.day_offset || ' days')) AS INTEGER) IN (1, 3, 5)) OR -- Mon, Wed, Fri
    (c.id = 2 AND CAST(strftime('%w', date('now', '+' || d.day_offset || ' days')) AS INTEGER) IN (2, 4)) OR -- Tue, Thu
    (c.id = 3 AND CAST(strftime('%w', date('now', '+' || d.day_offset || ' days')) AS INTEGER) = 6) OR -- Saturday
    (c.id = 4 AND CAST(strftime('%w', date('now', '+' || d.day_offset || ' days')) AS INTEGER) IN (1, 4)) OR -- Mon, Thu
    (c.id = 5 AND CAST(strftime('%w', date('now', '+' || d.day_offset || ' days')) AS INTEGER) IN (2, 5)); -- Tue, Fri

-- Insert sample bookings
INSERT OR REPLACE INTO class_bookings (user_id, class_instance_id, status, payment_status, attended) 
SELECT 
    2 as user_id, -- John Doe
    ci.id as class_instance_id,
    'confirmed' as status,
    'paid' as payment_status,
    CASE WHEN ci.date < date('now') THEN 1 ELSE 0 END as attended
FROM class_instances ci 
WHERE ci.date >= date('now', '-7 days') AND ci.date <= date('now', '+7 days')
LIMIT 5;

-- Insert sample payments
INSERT OR REPLACE INTO payments (user_id, amount, payment_type, payment_method, description, payment_date) VALUES
(2, 150.00, 'membership', 'credit_card', 'Monthly Premium Membership', datetime('now', '-15 days')),
(3, 100.00, 'membership', 'debit_card', 'Monthly Basic Membership', datetime('now', '-10 days')),
(4, 150.00, 'membership', 'credit_card', 'Monthly Premium Membership', datetime('now', '-5 days')),
(2, 25.00, 'class', 'credit_card', 'Boxing Fundamentals Class', datetime('now', '-3 days'));
