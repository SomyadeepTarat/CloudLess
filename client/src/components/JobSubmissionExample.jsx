import React, { useContext, useState } from 'react';
import AppContext from '../context/AppContext';
import * as api from '../services/api';

/**
 * Example component showing how to use the CloudLess API
 */
export default function JobSubmissionExample() {
    const { user, submitNewJob, loading, error } = useContext(AppContext);
    const [code, setCode] = useState('print("Hello from CloudLess!")');
    const [language, setLanguage] = useState('python');
    const [jobId, setJobId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const job = await submitNewJob(code, language);
            setJobId(job.job.jobId || job.job.job_id);
            setCode('');
        } catch (err) {
            console.error('Failed to submit job:', err);
        }
    };

    const handleCheckStatus = async () => {
        if (!jobId) return;
        try {
            const status = await api.getJobStatus(jobId);
            console.log('Job status:', status);
            alert(`Job Status: ${JSON.stringify(status, null, 2)}`);
        } catch (err) {
            console.error('Failed to check status:', err);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Submit a Job</h2>
            <p>User: {user?.username}</p>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label>Language:</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={styles.select}
                    >
                        <option>python</option>
                        <option>javascript</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label>Code:</label>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        rows={10}
                        style={styles.textarea}
                        placeholder="Enter your code here..."
                    />
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? 'Submitting...' : 'Submit Job'}
                </button>
            </form>

            {jobId && (
                <div style={styles.result}>
                    <p>✅ Job submitted successfully!</p>
                    <p>Job ID: <code>{jobId}</code></p>
                    <button onClick={handleCheckStatus} style={styles.button}>
                        Check Status
                    </button>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '600px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '1rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    select: {
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    textarea: {
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
    },
    button: {
        padding: '0.75rem',
        background: '#38bdf8',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    error: {
        color: '#ef4444',
    },
    result: {
        background: '#d1fae5',
        padding: '1rem',
        borderRadius: '4px',
        marginTop: '1rem',
    },
};
