const store = require('../data/store');

exports.getSystemStats = async (req, res) => {
    try {
        const stats = await store.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to fetch stats' });
    }
};
