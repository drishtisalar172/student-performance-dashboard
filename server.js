const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const FILE = 'data.json';

// Get data
app.get('/students', (req, res) => {
    const data = JSON.parse(fs.readFileSync(FILE));
    res.json(data);
});

// Add student
app.post('/add', (req, res) => {
    const data = JSON.parse(fs.readFileSync(FILE));
    data.push(req.body);
    fs.writeFileSync(FILE, JSON.stringify(data));
    res.send("Added");
});

// Overwrite (for delete)
app.post('/overwrite', (req, res) => {
    fs.writeFileSync(FILE, JSON.stringify(req.body));
    res.send("Updated");
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));