const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5001';

export const API_ENDPOINTS = {
    JOBS: `${API_BASE_URL}/jobs`,
    NODES: `${API_BASE_URL}/nodes`,
    LOGS: `${API_BASE_URL}/logs`,
    RECOMMENDER: `${API_BASE_URL}/recommender`,
};

const parseResponse = async (response) => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.error || data?.message || 'Request failed';
        throw new Error(message);
    }

    return data;
};

// Job APIs
export const submitJob = async ({ code, language, priority = 0, metadata = {} }) => {
    const response = await fetch(`${API_ENDPOINTS.JOBS}/job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, priority, metadata }),
    });
    return parseResponse(response);
};

export const getAllJobs = async () => {
    const response = await fetch(`${API_ENDPOINTS.JOBS}/all`);
    return parseResponse(response);
};

export const getJobStatus = async (jobId) => {
    const response = await fetch(`${API_ENDPOINTS.JOBS}/status/${jobId}`);
    return parseResponse(response);
};

// Node APIs
export const getNodes = async () => {
    const response = await fetch(`${API_ENDPOINTS.NODES}/all`);
    return parseResponse(response);
};

export const registerNode = async ({ worker_id, cpu = 0, ram = 0, status = 'idle', capabilities = {} }) => {
    const response = await fetch(`${API_ENDPOINTS.NODES}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id, cpu, ram, status, capabilities }),
    });
    return parseResponse(response);
};

export const recommendResources = async ({ code, filename }) => {
    const response = await fetch(`${API_ENDPOINTS.RECOMMENDER}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, filename }),
    });
    return parseResponse(response);
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

const api = {
    API_BASE_URL,
    WS_URL,
    API_ENDPOINTS,
    submitJob,
    getAllJobs,
    getJobStatus,
    getNodes,
    registerNode,
    recommendResources,
    healthCheck,
};

export default api;
