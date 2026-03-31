const jobService = require('../services/jobservice');

exports.submitJob = async (req, res) => {
    const { job_id, code, language, priority, metadata } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'code is required' });
    }

    try {
        const job = await jobService.submitJob({
            job_id,
            code,
            language: language || 'python',
            priority: typeof priority === 'number' ? priority : 0,
            metadata: metadata || {}
        });

        res.status(201).json({ message: 'Job submitted', job });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to submit job' });
    }
};

exports.getJob = async (req, res) => {
    const { worker_id } = req.query;

    if (!worker_id) {
        return res.status(400).json({ error: 'worker_id is required' });
    }

    try {
        const job = await jobService.getJobForWorker(worker_id);
        res.json(job || null);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to fetch job' });
    }
};

exports.submitResult = async (req, res) => {
    const { worker_id, job_id, output, status, time_taken } = req.body;

    if (!worker_id || !job_id) {
        return res.status(400).json({ error: 'worker_id and job_id are required' });
    }

    try {
        const result = await jobService.submitResult(worker_id, job_id, output, status, time_taken);
        res.json({ message: 'Result received', result });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to submit result' });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await jobService.getAllJobs();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to fetch jobs' });
    }
};

exports.getJobStatus = async (req, res) => {
    const { jobId } = req.params;
    const status = await jobService.getJobStatus(jobId);

    if (!status) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json(status);
};
