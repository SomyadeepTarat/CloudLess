import { createContext, useState, useCallback } from 'react';
import * as api from '../services/api';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
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

    const submitNewJob = useCallback(async (code, language) => {
        try {
            setLoading(true);
            const job = await api.submitJob(code, language);
            setJobs((prev) => [...prev, job]);
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

    const addLog = useCallback((logMessage) => {
        setLogs((prev) => [...prev, { ...logMessage, timestamp: Date.now() }]);
    }, []);

    const login = useCallback((userData) => {
        setUser(userData);
        setError(null);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setJobs([]);
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
        submitNewJob,
        addLog,
        login,
        logout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
