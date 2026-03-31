const store = require('../data/store');

async function addJob(job) {
    await store.withLock(async () => {
        const jobQueue = await store.getJobQueue();
        jobQueue.push(job);
        jobQueue.sort((a, b) => b.priority - a.priority);
        await store.setJobQueue(jobQueue);
    });
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

async function assignJob(nodeId) {
    return store.withLock(async () => {
        const [jobQueue, nodes, activeJobs] = await Promise.all([
            store.getJobQueue(),
            store.getNodes(),
            store.getActiveJobs(),
        ]);

        if (jobQueue.length === 0) return null;

        const node = nodes[nodeId];
        if (!node) {
            return null;
        }

        node.worker_id = nodeId;
        node.id = nodeId;

        const jobIndex = jobQueue.findIndex((job) => canWorkerRunJob(node, job));
        if (jobIndex === -1) {
            return null;
        }

        const [job] = jobQueue.splice(jobIndex, 1);

        activeJobs[job.jobId] = {
            nodeId,
            startTime: Date.now(),
            metadata: job.metadata || {}
        };

        nodes[nodeId].available_slots = Math.max(0, (nodes[nodeId].available_slots || 1) - 1);
        nodes[nodeId].status = nodes[nodeId].available_slots > 0 ? 'idle' : 'busy';

        await Promise.all([
            store.setJobQueue(jobQueue),
            store.setNodes(nodes),
            store.setActiveJobs(activeJobs),
        ]);

        return job;
    });
}

async function completeJob(nodeId, jobId, result) {
    await store.withLock(async () => {
        const [results, activeJobs, nodes] = await Promise.all([
            store.getResults(),
            store.getActiveJobs(),
            store.getNodes(),
        ]);

        results[jobId] = result;
        delete activeJobs[jobId];

        if (nodes[nodeId]) {
            const maxWorkers = nodes[nodeId].max_workers || 1;
            nodes[nodeId].available_slots = Math.min(
                maxWorkers,
                (nodes[nodeId].available_slots || 0) + 1
            );
            nodes[nodeId].status = 'idle';
        }

        await Promise.all([
            store.setResults(results),
            store.setActiveJobs(activeJobs),
            store.setNodes(nodes),
        ]);
    });
}

module.exports = { addJob, assignJob, completeJob };
