const store = require('../data/store');
const scheduler = require('./schedulerservice');
const { v4: uuidv4 } = require('uuid');

function submitJob({ job_id, code, language, priority = 0, metadata = {} }) {
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

    scheduler.addJob(job);
    return job;
}

function getJobForWorker(workerId) {
    return scheduler.assignJob(workerId);
}

function submitResult(workerId, jobId, output, status, timeTaken) {
    const result = {
        worker_id: workerId,
        job_id: jobId,
        output,
        status,
        time_taken: timeTaken,
        completed_at: Date.now()
    };

    scheduler.completeJob(workerId, jobId, result);
    return result;
}

function getAllJobs() {
    return {
        pending: store.jobQueue,
        active: store.activeJobs,
        completed: store.results
    };
}

function getJobStatus(jobId) {
    if (store.results[jobId]) {
        return { status: 'completed', result: store.results[jobId] };
    }

    if (store.activeJobs[jobId]) {
        return { status: 'processing' };
    }

    const pending = store.jobQueue.find(j => j.jobId === jobId);
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
