const Database = require('better-sqlite3');
const db = new Database('inventory.db');

// Create products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Sample products data
const products = [
  { name: 'Laptop Computer', description: 'High-performance laptop with 16GB RAM', quantity: 15, price: 999.99, category: 'Electronics' },
  { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with USB receiver', quantity: 50, price: 24.99, category: 'Electronics' },
  { name: 'Mechanical Keyboard', description: 'RGB mechanical gaming keyboard', quantity: 30, price: 89.99, category: 'Electronics' },
  { name: 'USB-C Cable', description: 'Fast charging USB-C cable 6ft', quantity: 100, price: 12.99, category: 'Accessories' },
  { name: 'Phone Stand', description: 'Adjustable aluminum phone stand', quantity: 45, price: 19.99, category: 'Accessories' },
  { name: 'Webcam HD', description: '1080p HD webcam with microphone', quantity: 25, price: 49.99, category: 'Electronics' },
  { name: 'Monitor 27"', description: '4K UHD 27-inch monitor', quantity: 12, price: 349.99, category: 'Electronics' },
  { name: 'Desk Lamp LED', description: 'Adjustable LED desk lamp with USB port', quantity: 35, price: 34.99, category: 'Office' },
  { name: 'Office Chair', description: 'Ergonomic office chair with lumbar support', quantity: 8, price: 199.99, category: 'Furniture' },
  { name: 'Desk Mat', description: 'Large extended gaming desk mat', quantity: 60, price: 29.99, category: 'Accessories' },
  { name: 'Headphones', description: 'Noise-cancelling wireless headphones', quantity: 22, price: 149.99, category: 'Electronics' },
  { name: 'Portable SSD 1TB', description: 'External solid state drive 1TB', quantity: 18, price: 119.99, category: 'Storage' },
  { name: 'Notebook Set', description: 'Set of 3 premium notebooks', quantity: 75, price: 14.99, category: 'Office' },
  { name: 'Pen Pack', description: 'Pack of 12 ballpoint pens', quantity: 120, price: 8.99, category: 'Office' },
  { name: 'Monitor Stand', description: 'Wooden monitor stand with storage', quantity: 28, price: 39.99, category: 'Accessories' },
  { name: 'Cable Organizer', description: 'Cable management box', quantity: 55, price: 16.99, category: 'Accessories' },
  { name: 'Tablet 10"', description: '10-inch tablet with 64GB storage', quantity: 20, price: 299.99, category: 'Electronics' },
  { name: 'Smart Watch', description: 'Fitness tracking smart watch', quantity: 15, price: 179.99, category: 'Electronics' },
  { name: 'Bluetooth Speaker', description: 'Portable waterproof bluetooth speaker', quantity: 40, price: 59.99, category: 'Electronics' },
  { name: 'Whiteboard', description: 'Magnetic dry erase whiteboard 36x24', quantity: 10, price: 44.99, category: 'Office' }
];

// Insert sample products
const insert = db.prepare(`
  INSERT INTO products (name, description, quantity, price, category)
  VALUES (@name, @description, @quantity, @price, @category)
`);

// Clear existing data
db.exec('DELETE FROM products');

// Insert all products
const insertMany = db.transaction((products) => {
  for (const product of products) insert.run(product);
});

insertMany(products);

console.log('Database initialized successfully with 20 sample products!');

db.close();
