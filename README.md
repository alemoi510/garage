# Garage - Inventory Management System

A modern web application for managing retail store inventory. Browse, add, delete, and update product quantities with an intuitive interface.

## Features

- 📦 **Browse Products** - View all products in a responsive grid layout
- ➕ **Add Products** - Create new products with name, description, price, quantity, and category
- ✏️ **Edit Products** - Update product information
- 🔢 **Update Quantities** - Quickly adjust stock levels inline
- 🗑️ **Delete Products** - Remove products with confirmation
- 🔍 **Search** - Filter products by name, description, or category
- 📊 **Stock Indicators** - Visual indicators for low, medium, and high stock levels
- 💻 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd garage
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database with sample products:
```bash
npm run init-db
```

This will create a SQLite database with 20 pre-populated products.

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. The application will load with 20 sample products. You can:
   - Browse all products in the grid view
   - Search for products using the search bar
   - Add new products by clicking "Add New Product"
   - Edit existing products by clicking "Edit" on any product card
   - Delete products by clicking "Delete" (with confirmation)
   - Update quantities directly in the product cards

## Project Structure

```
garage/
├── server.js           # Express server with REST API
├── init-db.js          # Database initialization script
├── package.json        # Project dependencies and scripts
├── inventory.db        # SQLite database (created after init)
├── public/             # Frontend files
│   ├── index.html      # Main HTML page
│   ├── style.css       # Modern CSS styling
│   └── app.js          # JavaScript for interactivity
└── README.md           # This file
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `PATCH /api/products/:id/quantity` - Update product quantity
- `DELETE /api/products/:id` - Delete a product

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite with better-sqlite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Design**: Modern, responsive UI with CSS Grid and Flexbox

## License

MIT