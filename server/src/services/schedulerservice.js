const store = require('../data/store');

function addJob(job) {
    store.jobQueue.push(job);

    // priority scheduling (higher first)
    store.jobQueue.sort((a, b) => b.priority - a.priority);
}

function canWorkerRunJob(node, job) {
    if (!node) return false;
    if ((node.available_slots || 0) <= 0) return false;

    const requiresGpu = Boolean(job?.metadata?.gpu);
    const workerHasGpu = Boolean(node?.capabilities?.gpu);
    const preferredNodeId = job?.metadata?.preferredNodeId;

    if (preferredNodeId && preferredNodeId !== node.worker_id && preferredNodeId !== node.id) {
        return false;
    }

    if (requiresGpu && !workerHasGpu) {
        return false;
    }

    return true;
}

function assignJob(nodeId) {
    if (store.jobQueue.length === 0) return null;
    const node = store.nodes[nodeId];

    if (!node) {
        return null;
    }

    node.worker_id = nodeId;
    node.id = nodeId;

    const jobIndex = store.jobQueue.findIndex((job) => canWorkerRunJob(node, job));
    if (jobIndex === -1) {
        return null;
    }

    const [job] = store.jobQueue.splice(jobIndex, 1);

    store.activeJobs[job.jobId] = {
        nodeId,
        startTime: Date.now(),
        metadata: job.metadata || {}
    };

    if (store.nodes[nodeId]) {
        store.nodes[nodeId].available_slots = Math.max(0, (store.nodes[nodeId].available_slots || 1) - 1);
        store.nodes[nodeId].status = store.nodes[nodeId].available_slots > 0 ? 'idle' : 'busy';
    }

    return job;
}

function completeJob(nodeId, jobId, result) {
    store.results[jobId] = result;

    delete store.activeJobs[jobId];

    if (store.nodes[nodeId]) {
        const maxWorkers = store.nodes[nodeId].max_workers || 1;
        store.nodes[nodeId].available_slots = Math.min(
            maxWorkers,
            (store.nodes[nodeId].available_slots || 0) + 1
        );
        store.nodes[nodeId].status = 'idle';
    }
}

module.exports = { addJob, assignJob, completeJob };
