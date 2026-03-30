const store = require('../data/store');

exports.getSystemStats = (req, res) => {
    res.json({
        totalNodes: Object.keys(store.nodes).length,
        activeJobs: Object.keys(store.activeJobs).length,
        pendingJobs: store.jobQueue.length,
        completedJobs: Object.keys(store.results).length
    });
};