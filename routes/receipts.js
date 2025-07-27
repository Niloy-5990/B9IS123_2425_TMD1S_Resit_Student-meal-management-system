const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, '../db/meal_management.db');

// Validate and sanitize order details before storing
function validateOrder(order) {
    try {
        // Ensure the order is a valid object with required properties
        if (typeof order !== 'object' || !order.name || !order.type || typeof order.price !== 'number') {
            throw new Error('Invalid order format');
        }
        return JSON.stringify(order);
    } catch (err) {
        console.error('Invalid order detected:', order, err.message);
        return null;
    }
}

// Generate a receipt
router.post('/receipts', (req, res) => {
    const { totalPrice, orders } = req.body; // Expecting orders array in the request body
    const receiptNumber = uuidv4();
    const timestamp = new Date().toISOString();

    console.log('Received request payload:', req.body); // Debugging log

    // Validate orders
    if (!Array.isArray(orders)) {
        return res.status(400).json({ error: "Invalid or missing 'orders' property. It must be an array." });
    }

    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
        console.log('Inserting into receipts table:', { receiptNumber, timestamp, totalPrice }); // Debugging log

        // Insert into receipts table
        db.run('INSERT INTO receipts (receipt_number, timestamp, total_price) VALUES (?, ?, ?)', [receiptNumber, timestamp, totalPrice], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            const receiptId = this.lastID;

            // Check if orders array is empty
            if (orders.length === 0) {
                db.close();
                return res.status(201).json({ id: receiptId, receiptNumber, timestamp });
            }

            // Insert associated orders into orders table
            const orderStmt = db.prepare('INSERT INTO orders (receipt_id, meal_details) VALUES (?, ?)');
            let pendingInserts = orders.length;

            orders.forEach(order => {
                const validOrder = validateOrder(order);
                if (!validOrder) {
                    pendingInserts--;
                    if (pendingInserts === 0) {
                        orderStmt.finalize();
                        db.close();
                        res.status(201).json({ id: receiptId, receiptNumber, timestamp });
                    }
                    return;
                }

                console.log('Inserting order into orders table:', order); // Debugging log
                orderStmt.run(receiptId, validOrder, (err) => {
                    if (err) {
                        console.error('Error inserting order:', err.message);
                    } else {
                        console.log('Order inserted successfully:', order);
                    }

                    // Decrement pending inserts and close the database if all are done
                    pendingInserts--;
                    if (pendingInserts === 0) {
                        orderStmt.finalize();
                        db.close();
                        res.status(201).json({ id: receiptId, receiptNumber, timestamp });
                    }
                });
            });
        });
    });
});

// Fetch all orders
router.get('/orders', (req, res) => {
    const db = new sqlite3.Database(dbPath);

    db.all(`
        SELECT r.id AS receiptId, r.receipt_number AS receiptNumber, r.timestamp, r.total_price AS totalPrice, 
               o.meal_details AS mealDetails
        FROM receipts r
        LEFT JOIN orders o ON r.id = o.receipt_id
    `, (err, rows) => {
        if (err) {
            console.error('Error fetching orders:', err.message);
            res.status(500).json({ error: 'Failed to fetch orders' });
            return;
        }

        // Group orders by receiptId
        const ordersMap = {};
        rows.forEach(row => {
            if (!ordersMap[row.receiptId]) {
                ordersMap[row.receiptId] = {
                    receiptId: row.receiptNumber,
                    timestamp: row.timestamp,
                    totalPrice: row.totalPrice,
                    orders: []
                };
            }

            if (row.mealDetails) {
                try {
                    ordersMap[row.receiptId].orders.push(JSON.parse(row.mealDetails));
                } catch (err) {
                    console.error('Error parsing mealDetails JSON:', err.message);
                }
            }
        });

        // Convert the map to an array
        const orders = Object.values(ordersMap);

        res.status(200).json(orders);
    });

    db.close();
});

// Delete a receipt and its associated orders
router.delete('/receipts/:receiptId', (req, res) => {
    const { receiptId } = req.params;
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
        // Delete from receipts table
        db.run('DELETE FROM receipts WHERE receipt_number = ?', [receiptId], function (err) {
            if (err) {
                console.error('Error deleting receipt:', err.message);
                res.status(500).json({ error: 'Failed to delete receipt' });
                return;
            }

            console.log(`Receipt ${receiptId} deleted successfully.`);
            res.status(200).json({ message: `Receipt ${receiptId} and associated orders deleted successfully.` });
        });
    });

    db.close();
});

// Update an order by receiptId
router.put('/orders/:receiptId', (req, res) => {
    const { receiptId } = req.params;
    const { orders } = req.body; // Expecting updated orders array in the request body

    if (!Array.isArray(orders)) {
        return res.status(400).json({ error: "Invalid or missing 'orders' property. It must be an array." });
    }

    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
        // Delete existing orders for the receipt
        db.run('DELETE FROM orders WHERE receipt_id = (SELECT id FROM receipts WHERE receipt_number = ?)', [receiptId], function (err) {
            if (err) {
                console.error('Error deleting existing orders:', err.message);
                res.status(500).json({ error: 'Failed to update orders' });
                return;
            }

            console.log(`Existing orders for receipt ${receiptId} deleted successfully.`);

            // Insert updated orders
            const orderStmt = db.prepare('INSERT INTO orders (receipt_id, meal_details) VALUES ((SELECT id FROM receipts WHERE receipt_number = ?), ?)');
            let pendingInserts = orders.length;

            orders.forEach(order => {
                const validOrder = validateOrder(order);
                if (!validOrder) {
                    pendingInserts--;
                    if (pendingInserts === 0) {
                        orderStmt.finalize();
                        db.close();
                        res.status(200).json({ message: `Orders for receipt ${receiptId} updated successfully.` });
                    }
                    return;
                }

                orderStmt.run(receiptId, validOrder, (err) => {
                    if (err) {
                        console.error('Error inserting updated order:', err.message);
                    } else {
                        console.log('Updated order inserted successfully:', order);
                    }

                    // Decrement pending inserts and close the database if all are done
                    pendingInserts--;
                    if (pendingInserts === 0) {
                        orderStmt.finalize();
                        db.close();
                        res.status(200).json({ message: `Orders for receipt ${receiptId} updated successfully.` });
                    }
                });
            });
        });
    });
});

module.exports = router;
