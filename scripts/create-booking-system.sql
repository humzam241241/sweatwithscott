-- Create comprehensive booking system tables

-- Update classes table with more details
DROP TABLE IF EXISTS classes;
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    coach TEXT NOT NULL,
    day_of_week TEXT NOT NULL, -- Monday, Tuesday, etc.
    start_time TEXT NOT NULL, -- 09:00
    end_time TEXT NOT NULL, -- 10:00
    max_capacity INTEGER DEFAULT 20,
    level TEXT DEFAULT 'All Levels',
    price DECIMAL(10,2) DEFAULT 25.00,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create class instances (specific dates)
CREATE TABLE IF NOT EXISTS class_instances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    max_capacity INTEGER NOT NULL,
    current_bookings INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, cancelled, full
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(class_id) REFERENCES classes(id)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS class_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    class_instance_id INTEGER NOT NULL,
    booking_status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, waitlist, attended, no_show
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_date DATETIME,
    cancellation_reason TEXT,
    payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
    payment_method TEXT, -- drop_in, monthly, annual
    notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(class_instance_id) REFERENCES class_instances(id),
    UNIQUE(user_id, class_instance_id)
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS class_waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    class_instance_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notified_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(class_instance_id) REFERENCES class_instances(id),
    UNIQUE(user_id, class_instance_id)
);

-- Insert sample classes
INSERT OR REPLACE INTO classes (name, description, coach, day_of_week, start_time, end_time, max_capacity, level, price) VALUES
('Boxing Technique', 'Master the fundamentals and improve your technique', 'Kyle McLaughlin', 'Monday', '06:00', '07:00', 15, 'All Levels', 25.00),
('Strength & Conditioning', 'Build power and endurance for boxing', 'Humza Muhammad', 'Monday', '19:00', '20:00', 12, 'Intermediate', 25.00),
('Boxing Bootcamp', 'High-intensity conditioning and boxing drills', 'Scott McDonald', 'Tuesday', '06:00', '07:00', 20, 'All Levels', 25.00),
('Teen Boxing', 'Boxing classes for teenage athletes', 'Kyle McLaughlin', 'Tuesday', '16:00', '17:00', 10, 'Ages 13-16', 20.00),
('Women''s Boxing', 'Boxing classes in a women-only environment', 'Scott McDonald', 'Tuesday', '19:00', '20:00', 15, 'All Levels', 25.00),
('Boxing Technique', 'Master the fundamentals and improve your technique', 'Kyle McLaughlin', 'Wednesday', '06:00', '07:00', 15, 'All Levels', 25.00),
('Strength & Conditioning', 'Advanced strength and conditioning', 'Humza Muhammad', 'Wednesday', '19:00', '20:00', 12, 'Advanced', 25.00),
('Boxing Bootcamp', 'High-intensity conditioning and boxing drills', 'Scott McDonald', 'Thursday', '06:00', '07:00', 20, 'All Levels', 25.00),
('Teen Boxing', 'Boxing classes for teenage athletes', 'Kyle McLaughlin', 'Thursday', '16:00', '17:00', 10, 'Ages 13-16', 20.00),
('Boxing Technique', 'Intermediate boxing techniques', 'Kyle McLaughlin', 'Thursday', '19:00', '20:00', 15, 'Intermediate', 25.00),
('Boxing Technique', 'Master the fundamentals and improve your technique', 'Kyle McLaughlin', 'Friday', '06:00', '07:00', 15, 'All Levels', 25.00),
('Open Gym', 'Self-directed training for members', 'Self-Directed', 'Friday', '19:00', '20:00', 25, 'Members Only', 0.00),
('Boxing Bootcamp', 'Weekend high-intensity training', 'Scott McDonald', 'Saturday', '09:00', '10:00', 20, 'All Levels', 25.00),
('Junior Jabbers', 'Boxing classes for young athletes', 'Humza Muhammad', 'Saturday', '10:00', '11:00', 12, 'Ages 6-12', 15.00),
('Teen Boxing', 'Weekend boxing for teens', 'Kyle McLaughlin', 'Saturday', '11:30', '12:30', 10, 'Ages 13-16', 20.00),
('Open Gym', 'Self-directed training for members', 'Self-Directed', 'Sunday', '10:00', '11:00', 25, 'Members Only', 0.00);

-- Create function to generate class instances for the next 30 days
-- This would typically be done with a stored procedure or cron job
-- For now, we'll create instances manually in the API
