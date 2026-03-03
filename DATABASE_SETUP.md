# Boxing Gym Database Setup

## Quick Start

1. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

2. **Set up the database:**
\`\`\`bash
npm run db:setup
\`\`\`

3. **Start the development server:**
\`\`\`bash
npm run dev
\`\`\`

## Database Commands

- `npm run db:setup` - Creates and initializes the database with sample data
- `npm run db:reset` - Deletes and recreates the database from scratch
- `npm run db:generate-instances` - Generates class instances for the next 30 days

## Database Structure

### Core Tables:
- **users** - Member accounts and admin users
- **classes** - Master class templates (recurring schedule)
- **class_instances** - Specific date/time occurrences of classes
- **class_bookings** - Individual member bookings
- **class_waitlist** - Queue when classes are full

### Key Features:
- **Automatic class generation** - Creates instances for 30 days ahead
- **Real-time capacity tracking** - Updates as bookings are made/cancelled
- **Attendance tracking** - Mark present/absent/late/no-show
- **Payment integration ready** - Tracks payment status per booking
- **Waitlist management** - Automatic promotion when spots open

## Database Location

The SQLite database file is created at: `./gym.db`

## Adding New Classes

To add a new recurring class:

\`\`\`sql
INSERT INTO classes (name, description, coach, day_of_week, start_time, end_time, max_capacity, level, price)
VALUES ('New Class', 'Description', 'Coach Name', 'Monday', '18:00', '19:00', 15, 'All Levels', 25.00);
\`\`\`

Then run: `npm run db:generate-instances` to create bookable instances.

## Production Considerations

1. **Backup Strategy**: Set up regular database backups
2. **Performance**: Consider PostgreSQL for high-traffic scenarios
3. **Security**: Implement proper password hashing (bcrypt)
4. **Monitoring**: Add database performance monitoring
5. **Scaling**: Consider connection pooling for multiple users

## Troubleshooting

- **Permission errors**: Ensure the project directory is writable
- **Database locked**: Close any database browser tools
- **Missing data**: Run `npm run db:setup` to reinitialize
