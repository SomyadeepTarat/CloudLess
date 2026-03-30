const jobService = require('../services/jobservice');

exports.submitJob = (req, res) => {
    const { job_id, code, language, priority, metadata } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'code is required' });
    }

    const job = jobService.submitJob({
        job_id,
        code,
        language: language || 'python',
        priority: typeof priority === 'number' ? priority : 0,
        metadata: metadata || {}
    });

    res.status(201).json({ message: 'Job submitted', job });
};

exports.getJob = (req, res) => {
    const { worker_id } = req.query;

    if (!worker_id) {
        return res.status(400).json({ error: 'worker_id is required' });
    }

    const job = jobService.getJobForWorker(worker_id);
    res.json(job || null);
};

exports.submitResult = (req, res) => {
    const { worker_id, job_id, output, status, time_taken } = req.body;

    if (!worker_id || !job_id) {
        return res.status(400).json({ error: 'worker_id and job_id are required' });
    }

    const result = jobService.submitResult(worker_id, job_id, output, status, time_taken);
    res.json({ message: 'Result received', result });
};

exports.getAllJobs = (req, res) => {
    const jobs = jobService.getAllJobs();
    res.json(jobs);
};

exports.getJobStatus = (req, res) => {
    const { jobId } = req.params;
    const status = jobService.getJobStatus(jobId);

    if (!status) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json(status);
};
