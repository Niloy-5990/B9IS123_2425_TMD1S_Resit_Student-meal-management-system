const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/meal_management.db');

// Get all meals
router.get('/meals', (req, res) => {
    const db = new sqlite3.Database(dbPath);
    db.all('SELECT * FROM meals', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
    db.close();
});

// Add a new meal
router.post('/meals', (req, res) => {
    const { name, type, price } = req.body;
    const db = new sqlite3.Database(dbPath);
    db.run('INSERT INTO meals (name, type, price) VALUES (?, ?, ?)', [name, type, price], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID });
        }
    });
    db.close();
});

// Delete a meal
router.delete('/meals/:id', (req, res) => {
    const { id } = req.params;
    const db = new sqlite3.Database(dbPath);
    db.run('DELETE FROM meals WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ deleted: this.changes });
        }
    });
    db.close();
});

// Add additional meal dynamically
router.post('/additional-meals', (req, res) => {
    const { name, type, price } = req.body;
    const db = new sqlite3.Database(dbPath);
    db.run('INSERT INTO meals (name, type, price) VALUES (?, ?, ?)', [name, type, price], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID });
        }
    });
    db.close();
});

// Remove additional meal
router.delete('/additional-meals/:id', (req, res) => {
    const { id } = req.params;
    const db = new sqlite3.Database(dbPath);
    db.run('DELETE FROM meals WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ deleted: this.changes });
        }
    });
    db.close();
});

module.exports = router;
