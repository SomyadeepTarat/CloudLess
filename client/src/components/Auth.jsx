import { useState } from 'react';
import { useContext } from 'react';
import AppContext from '../context/AppContext';

export default function Auth({ onLogin }) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (!username.trim()) {
            setError('Username is required');
            return;
        }
        onLogin({ username, id: Date.now() });
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logo}>
                    <svg width={40} height={40} viewBox="0 0 22 22" fill="none">
                        <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#38bdf8" strokeWidth={1.5} fill="none" />
                        <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" fill="#38bdf8" opacity={0.2} />
                        <circle cx={11} cy={11} r={2.5} fill="#38bdf8" />
                    </svg>
                </div>
                <h1 style={styles.title}>CLOUDLESS</h1>
                <p style={styles.subtitle}>Distributed Compute Platform</p>

                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError('');
                        }}
                        style={styles.input}
                    />
                    {error && <p style={styles.error}>{error}</p>}
                    <button type="submit" style={styles.button}>
                        Enter CloudLess
                    </button>
                </form>

                <p style={styles.info}>
                    Connect to the distributed compute network
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    card: {
        background: '#1e293b',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #334155',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    logo: {
        marginBottom: '1.5rem',
    },
    title: {
        margin: '0 0 0.5rem 0',
        color: '#e2e8f0',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    subtitle: {
        margin: '0 0 2rem 0',
        color: '#94a3b8',
        fontSize: '0.875rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    input: {
        padding: '0.75rem',
        border: '1px solid #334155',
        borderRadius: '6px',
        background: '#0f172a',
        color: '#e2e8f0',
        fontSize: '1rem',
        outline: 'none',
    },
    button: {
        padding: '0.75rem',
        background: '#38bdf8',
        color: '#0f172a',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    error: {
        color: '#ef4444',
        fontSize: '0.875rem',
        margin: 0,
    },
    info: {
        marginTop: '1rem',
        color: '#64748b',
        fontSize: '0.875rem',
    },
};
