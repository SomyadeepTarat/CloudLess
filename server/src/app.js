const express = require('express');
const cors = require('cors');
const logRoutes = require('./routes/logroutes');
const nodeRoutes = require('./routes/noderoutes');
const jobRoutes = require('./routes/jobroutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', nodeRoutes);
app.use('/', jobRoutes);
app.use('/logs', logRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'CloudLess backend running' });
});

module.exports = app;