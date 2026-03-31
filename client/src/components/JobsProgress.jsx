import { useState } from "react";

const MOCK_JOBS = [
  { id: "1001", name: "Job 1", from: "anupam", to: "gpu-worker-01", ts: "2026-03-30  11:04" },
  { id: "1002", name: "Job 2", from: "anupam", to: "gpu-worker-03", ts: "2026-03-30  10:41" },
  { id: "1005", name: "Job 3", from: "anupam", to: "cpu-worker-05", ts: "2026-03-30  11:09" },
  { id: "1007", name: "Job 4", from: "anupam", to: "gpu-worker-02", ts: "2026-03-30  11:14" },
  { id: "1010", name: "Job 5", from: "anupam", to: "cpu-worker-01", ts: "2026-03-30  10:58" },
];

function JobRow({ job }) {
  return (
    <div style={styles.row}>
      <span style={styles.jobId}>#{job.id}</span>
      <span style={styles.jobName}>{job.name}</span>
      <span style={styles.meta}>from <span style={styles.node}>{job.from}</span></span>
      <span style={styles.meta}>→</span>
      <span style={styles.node}>{job.to}</span>
      <span style={styles.ts}>{job.ts}</span>
    </div>
  );
}

export default function JobsProgress({ jobs: propJobs }) {
  const [jobs] = useState(propJobs || MOCK_JOBS);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>JOB HISTORY</span>
      </div>

      <div style={styles.list}>
        {jobs.length === 0 && <div style={styles.empty}>no jobs yet</div>}
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} />
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
  },
  title: { fontSize: "15px", fontWeight: 700, letterSpacing: "0.12em", color: "#94a3b8" },
  count: { fontSize: "15px", color: "#334155" },
  list: { overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#1e293b transparent" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "75px",
    padding: "15px 25px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    flexWrap: "wrap",
  },
  jobId: { fontSize: "10px", color: "#e2e8f0", minWidth: 40 },
  jobName: { fontSize: "12px", color: "#e2e8f0", fontWeight: 600, flex: 1 },
  meta: { fontSize: "10px", color: "#e2e8f0" },
  node: { fontSize: "11px", color: "#e2e8f0" },
  ts: { fontSize: "10px", color: "#e2e8f0", marginLeft: "auto" },
  empty: { padding: "24px 16px", fontSize: "11px", color: "#334155", textAlign: "center" },
};
