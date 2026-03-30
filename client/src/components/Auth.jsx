import { useState } from 'react';

export default function Auth({ onLogin }) {
    const [username, setUsername] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (!username.trim()) return;
        onLogin({ username, id: Date.now() });
    };

    return (
        <div className="dashboard-root" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <svg width="60" height="60" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M35 32C38.3137 32 41 29.3137 41 26C41 22.6863 38.3137 20 35 20C34.7732 20 34.5496 20.0126 34.33 20.0372C33.0955 16.511 29.8375 14 26 14C21.8579 14 18.5 17.3579 18.5 21.5C18.5 21.5968 18.5019 18.6931 18.5058 18.7889C15.125 19.175 12.5 22.2801 12.5 26C12.5 30.1421 15.8579 33.5 20 33.5H35" stroke="#D8B4FE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h1 className="card-title" style={{ fontSize: '2.5rem' }}>CloudLess</h1>
                    <p className="card-desc">Distributed Compute Platform</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ textAlign: 'center' }}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Enter CloudLess
                    </button>
                </form>
            </div>
        </div>
    );
}
