const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, './db/meal_management.db');

// Retry mechanism for deleting the database file
const deleteDatabaseFile = (retries = 5) => {
    if (fs.existsSync(dbPath)) {
        try {
            fs.unlinkSync(dbPath);
            console.log('Database file deleted successfully.');
        } catch (err) {
            if (retries > 0 && err.code === 'EBUSY') {
                console.log('Database file is busy. Retrying...');
                setTimeout(() => deleteDatabaseFile(retries - 1), 100);
            } else {
                console.error('Error deleting database file:', err.message);
            }
        }
    }
};

deleteDatabaseFile();

const db = new sqlite3.Database(dbPath);

// Create tables
const createTables = `
CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('breakfast', 'lunch', 'dinner', 'additional')),
    price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_number TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    total_price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_id INTEGER NOT NULL,
    meal_details TEXT NOT NULL,
    FOREIGN KEY (receipt_id) REFERENCES receipts (id) ON DELETE CASCADE
);
`;

// Seed data for meals
const seedMeals = `
INSERT INTO meals (name, type, price) VALUES
('Pancakes', 'breakfast', 5.99),
('Omelette', 'breakfast', 4.99),
('Sandwich', 'lunch', 6.99),
('Salad', 'lunch', 5.49),
('Steak', 'dinner', 12.99),
('Pasta', 'dinner', 10.99),
('Fries', 'additional', 3.99),
('Ice Cream', 'additional', 4.99);
`;

// Execute queries
db.serialize(() => {
    db.exec(createTables, (err) => {
        if (err) {
            console.error('Error creating tables:', err.message);
        } else {
            console.log('Tables created successfully.');
        }
    });

    db.exec(seedMeals, (err) => {
        if (err) {
            console.error('Error seeding meals:', err.message);
        } else {
            console.log('Meals seeded successfully.');
        }
    });
});

db.close();
