const store = require('../data/store');
const scheduler = require('./schedulerservice');
const { v4: uuidv4 } = require('uuid');

async function submitJob({ job_id, code, language, priority = 0, metadata = {} }) {
    const id = job_id || uuidv4();
    const job = {
        jobId: id,
        job_id: id,
        code,
        language,
        priority,
        metadata,
        status: 'pending',
        created_at: Date.now()
    };

    await scheduler.addJob(job);
    return job;
}

function getJobForWorker(workerId) {
    return scheduler.assignJob(workerId);
}

async function submitResult(workerId, jobId, output, status, timeTaken) {
    const activeJobs = await store.getActiveJobs();
    const activeJob = activeJobs[jobId] || {};
    const result = {
        worker_id: workerId,
        job_id: jobId,
        output,
        status,
        time_taken: timeTaken,
        metadata: activeJob.metadata || {},
        completed_at: Date.now()
    };

    await scheduler.completeJob(workerId, jobId, result);
    return result;
}

async function getAllJobs() {
    const [pending, active, completed] = await Promise.all([
        store.getJobQueue(),
        store.getActiveJobs(),
        store.getResults(),
    ]);

    return {
        pending,
        active,
        completed
    };
}

async function getJobStatus(jobId) {
    const [results, activeJobs, jobQueue] = await Promise.all([
        store.getResults(),
        store.getActiveJobs(),
        store.getJobQueue(),
    ]);

    if (results[jobId]) {
        return { status: 'completed', result: results[jobId] };
    }

    if (activeJobs[jobId]) {
        return { status: 'processing' };
    }

    const pending = jobQueue.find((j) => j.jobId === jobId);
    if (pending) {
        return { status: 'pending' };
    }

    return null;
}

module.exports = {
    submitJob,
    getJobForWorker,
    submitResult,
    getAllJobs,
    getJobStatus
};
