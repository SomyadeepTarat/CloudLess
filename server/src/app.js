const express = require('express');
const cors = require('cors');

const logRoutes = require('./routes/logroutes');
const nodeRoutes = require('./routes/noderoutes');
const jobRoutes = require('./routes/jobroutes');
const recommenderRoutes = require('./routes/recommenderroutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'CloudLess backend running 🚀' });
});
 
app.use('/nodes', nodeRoutes);
app.use('/jobs', jobRoutes);
app.use('/logs', logRoutes);
app.use('/recommender', recommenderRoutes);

module.exports = app;
