const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database('inventory.db');
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// GET all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY name').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new product
app.post('/api/products', (req, res) => {
  try {
    const { name, description, quantity, price, category } = req.body;
    
    // Validation
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    if (quantity < 0 || price < 0) {
      return res.status(400).json({ error: 'Quantity and price must be non-negative' });
    }
    
    const insert = db.prepare(`
      INSERT INTO products (name, description, quantity, price, category)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(name, description || '', quantity || 0, price, category || '');
    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  try {
    const { name, description, quantity, price, category } = req.body;
    const id = req.params.id;
    
    // Check if product exists
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Validation
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ error: 'Quantity must be non-negative' });
    }
    
    if (price !== undefined && price < 0) {
      return res.status(400).json({ error: 'Price must be non-negative' });
    }
    
    const update = db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, quantity = ?, price = ?, category = ?
      WHERE id = ?
    `);
    
    update.run(
      name !== undefined ? name : existing.name,
      description !== undefined ? description : existing.description,
      quantity !== undefined ? quantity : existing.quantity,
      price !== undefined ? price : existing.price,
      category !== undefined ? category : existing.category,
      id
    );
    
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update product quantity
app.patch('/api/products/:id/quantity', (req, res) => {
  try {
    const { quantity } = req.body;
    const id = req.params.id;
    
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }
    
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const update = db.prepare('UPDATE products SET quantity = ? WHERE id = ?');
    update.run(quantity, id);
    
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  try {
    const id = req.params.id;
    
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const deleteStmt = db.prepare('DELETE FROM products WHERE id = ?');
    deleteStmt.run(id);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
