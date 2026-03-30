import { useState } from "react";

const SAMPLE_JOBS = [
  { id: "8821", name: "train.py", status: "running", submitted: "11:04" },
  { id: "8820", name: "inference.py", status: "complete", submitted: "10:41" },
  { id: "8819", name: "preprocess.py", status: "failed", submitted: "11:09" },
];

const STATUS_COLOR = {
  running: "#4ade80",
  complete: "#38bdf8",
  failed: "#f87171",
  queued: "#facc15",
};

export default function Receive() {
  const [script, setScript] = useState("");
  const [ram, setRam] = useState("");
  const [gpu, setGpu] = useState(false);
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!script.trim()) return;
    const newJob = {
      id: String(Math.floor(Math.random() * 9000) + 1000),
      name: script,
      status: "queued",
      submitted: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
    };
    setJobs((prev) => [newJob, ...prev]);
    setScript("");
    setRam("");
    setGpu(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={styles.container}>
      {/* Submit form */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Submit a Job</h2>
        <p style={styles.cardDesc}>Enter your script name and resource needs. It'll be picked up by an available node.</p>

        <div style={styles.field}>
          <label style={styles.label}>Script / Task</label>
          <input
            style={styles.input}
            placeholder="e.g. train.py"
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>RAM needed (GB) — optional</label>
          <input
            style={styles.input}
            placeholder="e.g. 8"
            value={ram}
            onChange={(e) => setRam(e.target.value)}
            type="number"
          />
        </div>

        <div style={styles.checkRow}>
          <input
            id="gpu"
            type="checkbox"
            checked={gpu}
            onChange={(e) => setGpu(e.target.checked)}
            style={{ accentColor: "#38bdf8", width: 14, height: 14 }}
          />
          <label htmlFor="gpu" style={styles.checkLabel}>Requires GPU</label>
        </div>

        <button style={styles.btn} onClick={handleSubmit}>
          Submit Job
        </button>

        {submitted && <p style={styles.successMsg}>✓ Job added to queue</p>}
      </div>

      {/* Job history */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Your Jobs</h2>
        {jobs.length === 0 && <p style={styles.cardDesc}>No jobs yet.</p>}
        <div style={styles.jobList}>
          {jobs.map((job) => (
            <div key={job.id} style={styles.jobRow}>
              <div>
                <span style={styles.jobName}>{job.name}</span>
                <span style={styles.jobId}> #{job.id}</span>
              </div>
              <div style={styles.jobRight}>
                <span style={styles.jobTime}>{job.submitted}</span>
                <span style={{ ...styles.jobStatus, color: STATUS_COLOR[job.status] || "#94a3b8" }}>
                  {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 6000,
    width: "100%",
  },
  card: {
    background: "#0a0f1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  cardTitle: { margin: 0, fontSize: 19, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.05em" },
  cardDesc: { margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 14, color: "#94a3b8", letterSpacing: "0.08em", fontWeight: 600 },
  input: {
    background: "#060b14",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    padding: "8px 12px",
    color: "#e2e8f0",
    fontSize: 19,
    fontFamily: "inherit",
    outline: "none",
  },
  checkRow: { display: "flex", alignItems: "center", gap: 8 },
  checkLabel: { fontSize: 14, color: "#94a3b8", cursor: "pointer" },
  btn: {
    background: "#38bdf8",
    color: "#060b14",
    border: "none",
    borderRadius: 6,
    padding: "9px 18px",
    fontSize: 11,
    fontWeight: 800,
    fontFamily: "inherit",
    letterSpacing: "0.08em",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  successMsg: { margin: 0, fontSize: 14, color: "#4ade80" },
  jobList: { display: "flex", flexDirection: "column", gap: 1 },
  jobRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  jobName: { fontSize: 19, color: "#e2e8f0", fontWeight: 600 },
  jobId: { fontSize: 10, color: "#475569" },
  jobRight: { display: "flex", alignItems: "center", gap: 12 },
  jobTime: { fontSize: 10, color: "#334155" },
  jobStatus: { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" },
};
