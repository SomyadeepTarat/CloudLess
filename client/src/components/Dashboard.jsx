import { useContext, useEffect, useMemo, useState } from "react";
import Share from "./Share";
import Receive from "./Receive";
import AppContext from "../context/AppContext";

const NAV = ["OVERVIEW", "SHARE", "RECEIVE"];

const formatAge = (timestamp) => {
  if (!timestamp) return "just now";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function Dashboard({ user }) {
  const [tab, setTab] = useState("OVERVIEW");
  const { jobs, nodes, loading, error, refreshDashboard, logout } = useContext(AppContext);

  useEffect(() => {
    refreshDashboard();

    const intervalId = window.setInterval(() => {
      refreshDashboard();
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [refreshDashboard]);

  const recentJobs = useMemo(() => {
    const pending = Array.isArray(jobs.pending) ? jobs.pending : [];
    const active = Object.entries(jobs.active || {}).map(([jobId, job]) => ({
      jobId,
      code: `Assigned to ${job.nodeId || "worker"}`,
      status: "processing",
      created_at: job.startTime,
      metadata: {},
    }));
    const completed = Object.entries(jobs.completed || {}).map(([jobId, result]) => ({
      jobId,
      code: result.output || "Completed job",
      status: result.status || "completed",
      created_at: result.completed_at,
      metadata: {},
    }));

    return [...pending, ...active, ...completed]
      .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
      .slice(0, 6);
  }, [jobs]);

  const nodeList = useMemo(() => Object.entries(nodes || {}), [nodes]);

  return (
    <div className="dashboard-root">
      <header className="topbar">
        <div className="brand" onClick={() => setTab("OVERVIEW")}>
          <div className="logo-container">
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M35 32C38.3137 32 41 29.3137 41 26C41 22.6863 38.3137 20 35 20C34.7732 20 34.5496 20.0126 34.33 20.0372C33.0955 16.511 29.8375 14 26 14C21.8579 14 18.5 17.3579 18.5 21.5C18.5 21.5968 18.5019 18.6931 18.5058 18.7889C15.125 19.175 12.5 22.2801 12.5 26C12.5 30.1421 15.8579 33.5 20 33.5H35" stroke="#D8B4FE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="brand-name">CloudLess</span>
        </div>

        <nav className="nav">
          {NAV.map((n) => (
            <button
              key={n}
              onClick={() => setTab(n)}
              className={`nav-btn ${tab === n ? "active" : ""}`}
            >
              {n}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <span className="user-chip">{user?.username}</span>
          <button className="nav-btn" onClick={logout}>LOGOUT</button>
        </div>
      </header>

      <main className="main-content">
        {tab === "OVERVIEW" && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div className="hero-logo">CloudLess</div>
            <div className="overview-stats">
              <div className="stat-card">
                <span className="stat-label">Shared Nodes</span>
                <strong className="stat-value">{nodeList.length}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Pending Jobs</span>
                <strong className="stat-value">{jobs.pending?.length || 0}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Completed Jobs</span>
                <strong className="stat-value">{Object.keys(jobs.completed || {}).length}</strong>
              </div>
            </div>
            {(loading || error) && (
              <div className={`status-banner ${error ? "error" : ""}`}>
                {error || "Refreshing cluster data..."}
              </div>
            )}
            <div style={{ width: '100%', maxWidth: '1000px' }}>
                <h3 className="section-title">Recent Activity</h3>
                <div className="history-list">
                    {recentJobs.length === 0 && (
                      <div className="empty-state">No jobs yet. Submit one in the receive tab or share a machine to get started.</div>
                    )}
                    {recentJobs.map((job) => (
                         <div key={job.jobId || job.code} className="node-item">
                            <div className={`badge ${job.metadata?.gpu ? "badge-purple" : ""}`}>
                              {job.metadata?.gpu ? "GPU" : "CPU"}
                            </div>
                            <div className="node-info">
                                <span className="node-name">{job.code}</span>
                                <span className="node-meta">
                                  {(job.status || "pending").toUpperCase()} • {formatAge(job.created_at)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
        {tab === "SHARE"   && <Share user={user} />}
        {tab === "RECEIVE" && <Receive user={user} />}
      </main>
    </div>
  );
}
