import { useContext, useMemo, useState } from "react";
import AppContext from "../context/AppContext";

export default function Receive({ user }) {
  const [script, setScript] = useState("");
  const [gpu, setGpu] = useState(false);
  const [gpuSize, setGpuSize] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { jobs, loading, submitNewJob } = useContext(AppContext);

  const jobHistory = useMemo(() => {
    const pending = Array.isArray(jobs.pending) ? jobs.pending : [];
    const completed = Object.entries(jobs.completed || {}).map(([jobId, result]) => ({
      jobId,
      code: result.output || "Completed job",
      metadata: {},
      status: result.status || "completed",
    }));

    return [...pending, ...completed].slice(0, 8);
  }, [jobs]);

  const handleSubmit = async () => {
    if (!script.trim()) {
      setError("Script/Task is required");
      setSuccess("");
      return;
    }
    if (gpu && (parseFloat(gpuSize) <= 0 || !gpuSize)) {
      setError("GPU Size must be greater than 0GB");
      setSuccess("");
      return;
    }
    setError("");

    try {
      const job = await submitNewJob({
        code: script.trim(),
        language: gpu ? "gpu" : "cpu",
        priority: gpu ? 1 : 0,
        metadata: {
          gpu,
          gpuSize: gpu ? parseFloat(gpuSize) : 0,
          requestedBy: user?.username || "anonymous",
        },
      });

      setSuccess(`Queued ${job.code}`);
      setScript("");
      setGpu(false);
      setGpuSize("");
    } catch (err) {
      setError(err.message || "Unable to submit job");
      setSuccess("");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '4rem' }}>
      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 className="card-title">Submit a Job</h2>
        <p className="card-desc">
          Enter your script name and resource needs. It will be picked up by an available node.
        </p>

        <div className="form-group" style={{ alignItems: 'center' }}>
          <label className="form-label">Script / Task</label>
          <input
            style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}
            placeholder="eg: Train.py"
            value={script}
            onChange={(e) => {
              setScript(e.target.value);
              if (e.target.value.trim()) setError("");
            }}
          />
        </div>

        <div className="checkbox-group" style={{ justifyContent: 'center' }}>
          <input
            id="gpu"
            type="checkbox"
            checked={gpu}
            onChange={(e) => {
              setGpu(e.target.checked);
              if (!e.target.checked) {
                setGpuSize("");
                setError("");
              }
            }}
          />
          <label htmlFor="gpu" className="checkbox-label">Requires GPU</label>
        </div>

        {gpu && (
          <div className="form-group" style={{ alignItems: 'center' }}>
            <label className="form-label">GPU Size (GB)</label>
            <input
              style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}
              placeholder="eg: 8"
              value={gpuSize}
              onChange={(e) => {
                setGpuSize(e.target.value);
                if (parseFloat(e.target.value) > 0) setError("");
              }}
              type="number"
            />
          </div>
        )}

        {error && <span style={{ color: '#f87171', fontSize: '0.75rem', textAlign: 'center' }}>{error}</span>}
        {success && <span style={{ color: '#d8b4fe', fontSize: '0.75rem', textAlign: 'center' }}>{success}</span>}

        <button className="btn-primary" style={{ background: '#36303c', color: '#b291d9' }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Job"}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '1000px' }}>
        <h3 className="section-title">Job History</h3>
        <div className="history-list">
          {jobHistory.length === 0 && (
            <div className="empty-state">Your submitted jobs will appear here once they are queued.</div>
          )}
          {jobHistory.map((job) => (
            <div key={job.jobId || job.code} className="node-item">
              <div className={`badge ${job.metadata?.gpu ? "badge-purple" : ""}`}>
                {job.metadata?.gpu ? "GPU" : "CPU"}
              </div>
              <div className="node-info">
                <span className="node-name">{job.code}</span>
                <span className="node-meta">
                  {job.metadata?.gpu
                    ? `${job.metadata.gpuSize || 0}GB GPU`
                    : "Standard CPU job"}
                  {" • "}
                  {job.metadata?.requestedBy || user?.username || "Unknown user"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
