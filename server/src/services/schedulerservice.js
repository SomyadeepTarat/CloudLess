const store = require('../data/store');

function addJob(job) {
    store.jobQueue.push(job);

    // priority scheduling (higher first)
    store.jobQueue.sort((a, b) => b.priority - a.priority);
}

function assignJob(nodeId) {
    if (store.jobQueue.length === 0) return null;

    const job = store.jobQueue.shift();

    store.activeJobs[job.jobId] = {
        nodeId,
        startTime: Date.now()
    };

    if (store.nodes[nodeId]) {
        store.nodes[nodeId].status = 'busy';
    }

    return job;
}

function completeJob(nodeId, jobId, result) {
    store.results[jobId] = result;

    delete store.activeJobs[jobId];

    if (store.nodes[nodeId]) {
        store.nodes[nodeId].status = 'idle';
    }
}

module.exports = { addJob, assignJob, completeJob };