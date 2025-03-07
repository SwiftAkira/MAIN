const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

// Path to the database file
const dbPath = path.join(__dirname, 'mydatabase.db');

// Path to the backup directory
const backupDir = path.join(__dirname, 'backups');

// Ensure the backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Function to create a backup of the database
const backupDatabase = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `mydatabase-backup-${timestamp}.db`);
  fs.copyFileSync(dbPath, backupPath);
  console.log(`Database backup created at ${backupPath}`);
};

// Schedule a backup every day at midnight
schedule.scheduleJob('0 0 * * *', backupDatabase);
