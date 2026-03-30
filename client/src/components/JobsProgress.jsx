import { useState, useEffect } from "react";

const STATUS_META = {
  running:  { color: "#4ade80", label: "RUNNING"},
  queued:   { color: "#facc15", label: "QUEUED"},
  failed:   { color: "#f87171", label: "FAILED"},
  complete: { color: "#38bdf8", label: "DONE"},
};

const MOCK_JOBS = [
  { name: "Job 1", node: "gpu-worker-01", gpu: "RTX 4090", progress: 62, status: "running",  eta: "14m 32s", submitted: "11:04" },
  { name: "Job 2",     node: "gpu-worker-03", gpu: "A100 80G", progress: 100, status: "complete", eta: "—",      submitted: "10:41" },
  { name: "Job 3",node: "cpu-worker-05", gpu: "—",        progress: 28,  status: "failed",  eta: "—",       submitted: "11:09" },
  { name: "Job 4",    node: "—",             gpu: "—",        progress: 0,   status: "queued",  eta: "~6m",     submitted: "11:14" },
  { name: "Job 5",      node: "gpu-worker-02", gpu: "RTX 3090", progress: 87,  status: "running", eta: "2m 11s",  submitted: "10:58" },
];

function ProgressBar({ value, color }) {
  return (
    <div style={styles.barTrack}>
      <div
        style={{
          ...styles.barFill,
          width: `${value}%`,
          background: color,
          boxShadow: `0 0 8px ${color}55`,
        }}
      />
    </div>
  );
}

function JobRow({ job }) {
  const meta = STATUS_META[job.status];
  return (
    <div style={styles.row}>
      <div style={styles.rowTop}>
        <div style={styles.jobLeft}>
          <span style={styles.jobName}>{job.name}</span>
        </div>
        <div style={styles.jobRight}>
          <span style={{ ...styles.statusBadge, color: meta.color, borderColor: meta.color + "44", background: meta.color + "11" }}>
            {meta.pulse && <span style={{ ...styles.pulseDot, background: meta.color }} />}
            {meta.label}
          </span>
        </div>
      </div>

      <ProgressBar value={job.progress} color={meta.color} />

      <div style={styles.rowMeta}>
        <span style={styles.metaItem}>MACHINE:{job.node}</span>
        <span style={styles.metaItem}>GPU CARD:{job.gpu}</span>
        <span style={{ ...styles.metaItem, marginLeft: "auto", color: meta.color, fontWeight: 700 }}>{job.progress}%</span>
      </div>
    </div>
  );
}

export default function JobsProgress({ jobs: propJobs }) {
  const [jobs, setJobs] = useState(propJobs || MOCK_JOBS);


  const counts = Object.keys(STATUS_META).reduce((acc, k) => {
    acc[k] = jobs.filter((j) => j.status === k).length;
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>JOBS IN PROGRESS</span>
        <div style={styles.summary}>
          {Object.entries(counts).map(([k, v]) => (
            <span key={k} style={{ ...styles.summaryChip, color: STATUS_META[k].color }}>
              {v} {k}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.list}>
        {jobs.map((job) => (
          <JobRow key={job.id} job={{ ...job, progress: Math.round(job.progress) }} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#0a0f1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    overflow: "hidden",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "#080d17",
    flexWrap: "wrap",
    gap: "8px",
  },
  title: { fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#94a3b8" },
  summary: { display: "flex", gap: "14px" },
  summaryChip: { fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" },
  list: { overflowY: "auto", flex: 1, scrollbarWidth: "thin", scrollbarColor: "#1e293b transparent" },
  row: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  rowTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  jobLeft: { display: "flex", alignItems: "center", gap: "10px" },
  jobId: { fontSize: "10px", color: "#475569", fontWeight: 700 },
  jobName: { fontSize: "13px", color: "#e2e8f0", fontWeight: 600 },
  jobRight: {},
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "3px 8px",
    borderRadius: "4px",
    border: "1px solid",
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    display: "inline-block",
    animation: "pulse 1.4s ease-in-out infinite",
  },
  barTrack: {
    height: 4,
    background: "rgba(255,255,255,0.05)",
    borderRadius: "99px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "99px",
    transition: "width 0.6s ease",
  },
  rowMeta: { display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" },
  metaItem: { fontSize: "10px", color: "#475569" },
};
