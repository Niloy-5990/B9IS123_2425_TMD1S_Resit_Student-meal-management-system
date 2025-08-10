                                                                Student Meal Management System 

Project Overview:
The Student Meal Management System is a web application that allows students to select and manage their daily meals (breakfast, lunch, dinner) along with additional meal options. The system provides real-time price calculation, receipt generation, and order confirmation functionality.

File Structure

```
.
├── .gitignore
├── README.md
├── index.html
├── script.js
├── styles.css
├── server.js
├── init.js
├── seed.js
├── db/
│   └── meal_management.db (created at runtime)
└── routes/
    ├── meals.js
    └── receipts.js
          ```

Core Files Documentation
index.html
The main HTML file that structures the web application. Key sections include:
- **Meal Selection**: Dropdown menus for breakfast, lunch, and dinner
- **Additional Meals**: Section to add extra meals
- **Order Summary**: Displays selected items and total price
- **Receipt Generation**: Button to generate and view receipts
- **Confirmed Orders**: Section showing all confirmed orders

script.js : Handles all client-side functionality:
- `fetchMeals()`: Retrieves meal options from the backend
- `populateDropdown()`: Fills dropdown menus with meal options
- `addAdditionalMeal()`: Adds an extra meal to the order
- `updateOrderSummary()`: Updates the displayed order summary
- `updatePrices()`: Calculates and displays the total price
- `generateReceipt()`: Creates a receipt with order details
- `showReceiptPreview()`: Displays receipt in a modal before confirmation
- `confirmOrder()`: Sends confirmed order to the backend
- `queryOrdersTable()`: Retrieves and displays all confirmed orders

Styles.css : Provides styling for the application with:
- Responsive layout for different screen sizes
- Clean, modern interface with cards and shadows
- Modal styling for receipt preview
- Color-coded buttons and interactive elements

server.js : The main Express server file that:
- Sets up middleware (body-parser, static files)
- Defines the root route serving index.html
- Includes API routes from /routes directory
- Starts the server on port 3000

Database Files: 

seed.js: Initializes the SQLite database with:
- Tables for meals, receipts, and orders
- Sample meal data (breakfast, lunch, dinner, additional options)
- Handles database file cleanup before seeding

init.js : Creates database tables if they don't exist:
- `meals`: Stores available meal options
- `receipts`: Stores receipt headers
- `orders`: Stores individual order items linked to receipts

Route Handlers : 

meals.js :API endpoints for meal management:
- `GET /meals`: Retrieve all meal options
- `POST /meals`: Add a new meal
- `DELETE /meals/:id`: Remove a meal
- Additional endpoints for managing extra meals

receipts.js: API endpoints for order processing:
- `POST /receipts`: Create a new receipt with order items
- `GET /orders`: Retrieve all confirmed orders
- `DELETE /receipts/:id`: Remove a receipt and its orders
- `PUT /orders/:id`: Update an existing order

Setup Instructions

1. Install dependencies:
   ```bash
   npm install express sqlite3 body-parser
   ```

2. Initialize the database:
   ```bash
   node seed.js
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. Access the application at:
   ```
   http://localhost:3000
   ```

Key Features

1. **Meal Selection**:
   - Choose from breakfast, lunch, and dinner options
   - Add extra meals as needed

2. **Real-time Updates**:
   - Order summary updates automatically
   - Total price calculated on the fly

3. **Order Management**:
   - Generate receipts with unique IDs
   - Preview before confirmation
   - View and manage all confirmed orders

4. **Database Integration**:
   - Persistent storage of meals and orders
   - SQLite database for simplicity

Troubleshooting

- If the database fails to initialize, delete the `meal_management.db` file and rerun `seed.js`
- Check console logs for API errors when making requests
- Ensure all dependencies are installed if the server fails to start




Project documentation Link :  https://docs.google.com/document/d/1VBwsMBVLcylGtdKoue-7ieB4W6qcGBE-FXKBTd6Jwws/edit?usp=sharing
