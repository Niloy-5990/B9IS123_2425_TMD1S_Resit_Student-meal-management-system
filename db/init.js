const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'meal_management.db');
const db = new sqlite3.Database(dbPath);

// Create tables
const createTables = () => {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            price REAL NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS receipts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            receipt_number TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            total_price REAL NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            receipt_id INTEGER NOT NULL,
            meal_details TEXT NOT NULL,
            FOREIGN KEY (receipt_id) REFERENCES receipts (id) ON DELETE CASCADE
        )`);

        console.log('Tables created successfully.');
    });
};

createTables();

module.exports = db;
