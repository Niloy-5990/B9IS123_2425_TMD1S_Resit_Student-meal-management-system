const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Predefined meal management routes
const mealsRoutes = require('./routes/meals');
app.use('/api', mealsRoutes);

// Use receipts routes
const receiptsRoutes = require('./routes/receipts');
app.use('/api', receiptsRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
