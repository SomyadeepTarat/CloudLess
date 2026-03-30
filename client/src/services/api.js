const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5001';

export const API_ENDPOINTS = {
    JOBS: `${API_BASE_URL}/jobs`,
    NODES: `${API_BASE_URL}/nodes`,
    LOGS: `${API_BASE_URL}/logs`,
};

// Job APIs
export const submitJob = async (code, language) => {
    const response = await fetch(`${API_ENDPOINTS.JOBS}/job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, priority: 0 }),
    });
    return response.json();
};

export const getAllJobs = async () => {
    const response = await fetch(`${API_ENDPOINTS.JOBS}/all`);
    return response.json();
};

export const getJobStatus = async (jobId) => {
    const response = await fetch(`${API_ENDPOINTS.JOBS}/status/${jobId}`);
    return response.json();
};

// Node APIs
export const getNodes = async () => {
    const response = await fetch(`${API_ENDPOINTS.NODES}/all`);
    return response.json();
};

// Health check
export const healthCheck = async () => {
    try {
        const response = await fetch(API_BASE_URL);
        return response.ok;
    } catch {
        return false;
    }
};

export default {
    API_BASE_URL,
    WS_URL,
    API_ENDPOINTS,
    submitJob,
    getAllJobs,
    getJobStatus,
    getNodes,
    healthCheck,
};
