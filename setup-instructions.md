# Boxing Gym System Setup Instructions

## Step 1: Install Dependencies
\`\`\`bash
npm install better-sqlite3 @types/better-sqlite3 bcryptjs @types/bcryptjs
\`\`\`

## Step 2: Initialize the Database
\`\`\`bash
npm run db:init
\`\`\`

## Step 3: Copy Your Existing Database (Optional)
If you want to use your existing Flask database:
\`\`\`bash
# Copy your existing gym.db file to the project root
cp /path/to/your/flask/gym.db ./gym.db
\`\`\`

## Step 4: Start the Development Server
\`\`\`bash
npm run dev
\`\`\`

## Step 5: Login Credentials
- **Admin**: username: `admin`, password: `admin123`
- **Demo Users**: username: `john_doe`, `jane_smith`, `mike_wilson`, password: `password123`

## Database Location
The SQLite database will be created at: `./gym.db`

## Troubleshooting
1. If you get permission errors, make sure the project directory is writable
2. If the database doesn't initialize, check that the SQL file exists in the scripts folder
3. For production, implement proper scrypt password verification for the admin user
