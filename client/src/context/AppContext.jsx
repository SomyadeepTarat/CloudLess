import { createContext, useState, useCallback } from 'react';
import * as api from '../services/api';

export const AppContext = createContext();
const STORAGE_KEY = 'cloudless-user';

const loadStoredUser = () => {
    try {
        if (typeof window === 'undefined') {
            return null;
        }
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export function AppProvider({ children }) {
    const [user, setUser] = useState(loadStoredUser);
    const [jobs, setJobs] = useState({ pending: [], active: {}, completed: {} });
    const [nodes, setNodes] = useState({});
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getAllJobs();
            setJobs(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchNodes = useCallback(async () => {
        try {
            const data = await api.getNodes();
            setNodes(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching nodes:', err);
        }
    }, []);

    const submitNewJob = useCallback(async (jobPayload) => {
        try {
            setLoading(true);
            const response = await api.submitJob(jobPayload);
            const job = response.job || response;
            setJobs((prev) => ({
                ...prev,
                pending: [job, ...(prev.pending || [])],
            }));
            const nodesData = await api.getNodes();
            setNodes(nodesData);
            setError(null);
            return job;
        } catch (err) {
            setError(err.message);
            console.error('Error submitting job:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const [jobsData, nodesData] = await Promise.all([
                api.getAllJobs(),
                api.getNodes(),
            ]);
            setJobs(jobsData);
            setNodes(nodesData);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error refreshing dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const registerSharedNode = useCallback(async ({ workerId, ram, hasGpu, username }) => {
        try {
            setLoading(true);
            const response = await api.registerNode({
                worker_id: workerId,
                ram,
                status: 'idle',
                capabilities: {
                    gpu: hasGpu,
                    sharedBy: username,
                },
            });

            setNodes((prev) => ({
                ...prev,
                [workerId]: {
                    ...(prev[workerId] || {}),
                    ram,
                    status: 'idle',
                    lastSeen: Date.now(),
                    cpu_usage: prev[workerId]?.cpu_usage || 0,
                    ram_usage: prev[workerId]?.ram_usage || 0,
                    capabilities: {
                        gpu: hasGpu,
                        sharedBy: username,
                    },
                },
            }));
            setError(null);
            return response;
        } catch (err) {
            setError(err.message);
            console.error('Error registering node:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const stopSharedNode = useCallback(async (workerId) => {
        try {
            setLoading(true);
            await api.stopNode({ worker_id: workerId });
            const nodesData = await api.getNodes();
            setNodes(nodesData);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error stopping node:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const addLog = useCallback((logMessage) => {
        setLogs((prev) => [...prev, { ...logMessage, timestamp: Date.now() }]);
    }, []);

    const login = useCallback((userData) => {
        setUser(userData);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        }
        setError(null);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(STORAGE_KEY);
        }
        setJobs({ pending: [], active: {}, completed: {} });
        setNodes({});
        setLogs([]);
    }, []);

    const value = {
        user,
        jobs,
        nodes,
        logs,
        loading,
        error,
        fetchJobs,
        fetchNodes,
        refreshDashboard,
        submitNewJob,
        registerSharedNode,
        stopSharedNode,
        addLog,
        login,
        logout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
