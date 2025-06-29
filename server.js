const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Define a secret API key (store in environment variables for production)
const API_KEY = "my-secret-api-key";

// Middleware to authenticate API key
app.use((req, res, next) => {
    const apiKey = req.headers['authorization']; // Expecting 'Bearer my-secret-api-key'

    if (!apiKey || apiKey.split(' ')[1] !== API_KEY) {
        return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
    }

    next();
});

// Load or create database file
const dbFile = './customerdata.json';
if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({}));
}

// Helper functions
const getDatabase = () => JSON.parse(fs.readFileSync(dbFile, 'utf8'));
const saveDatabase = (data) => fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));

// Routes

// Get all items in a player's bag
app.get('/user/:username/bag', (req, res) => {
    const username = req.params.username;
    const db = getDatabase();

    if (db[username] && db[username].Bag) {
        res.json(db[username].Bag);
    } else {
        res.status(404).json({ message: 'User or bag not found' });
    }
});

// Add an item to a player's bag
app.post('/user/:username/bag', (req, res) => {
    const username = req.params.username;
    const db = getDatabase();

    if (!db[username]) {
        db[username] = { Bag: [] }; // Initialize user if not exists
    }

    const item = req.body; // Expecting the item data in request body
    db[username].Bag.push(item);
    saveDatabase(db);

    res.json({ message: 'Item added to bag', item });
});

// Update an item in a player's bag
app.put('/user/:username/bag/:index', (req, res) => {
    const username = req.params.username;
    const index = parseInt(req.params.index);
    const db = getDatabase();

    if (!db[username] || !db[username].Bag || !db[username].Bag[index]) {
        res.status(404).json({ message: 'User or item not found' });
    } else {
        db[username].Bag[index] = req.body; // Update item at the given index
        saveDatabase(db);
        res.json({ message: 'Item updated', item: req.body });
    }
});

// Delete an item from a player's bag
app.delete('/user/:username/bag/:index', (req, res) => {
    const username = req.params.username;
    const index = parseInt(req.params.index);
    const db = getDatabase();

    if (!db[username] || !db[username].Bag || !db[username].Bag[index]) {
        res.status(404).json({ message: 'User or item not found' });
    } else {
        const removedItem = db[username].Bag.splice(index, 1); // Remove item
        saveDatabase(db);
        res.json({ message: 'Item removed', removedItem });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at https://sales.aloyce.com/${port}`);
});
