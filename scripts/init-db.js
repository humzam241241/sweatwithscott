const Database = require("better-sqlite3")
const path = require("path")
const fs = require("fs")

// Create database file
const dbPath = path.join(process.cwd(), "gym.db")
const db = new Database(dbPath)

console.log("Initializing database...")

// Read and execute the SQL schema
const schemaPath = path.join(__dirname, "update-database-schema.sql")
const schema = fs.readFileSync(schemaPath, "utf8")

// Split by semicolon and execute each statement
const statements = schema.split(";").filter((stmt) => stmt.trim().length > 0)

statements.forEach((statement) => {
  try {
    db.exec(statement)
  } catch (error) {
    console.error("Error executing statement:", statement.substring(0, 50) + "...")
    console.error(error.message)
  }
})

console.log("Database initialized successfully!")
console.log("Database file created at:", dbPath)

// Verify the setup
const users = db.prepare("SELECT COUNT(*) as count FROM users").get()
const bookings = db.prepare("SELECT COUNT(*) as count FROM bookings").get()
const attendance = db.prepare("SELECT COUNT(*) as count FROM attendance").get()

console.log(`Users: ${users.count}`)
console.log(`Bookings: ${bookings.count}`)
console.log(`Attendance records: ${attendance.count}`)

db.close()
