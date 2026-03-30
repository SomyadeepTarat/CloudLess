import { useState, useEffect, useRef } from "react";

const LOG_LEVELS = {
  INFO: { label: "INFO", color: "#4ade80" },
  WARN: { label: "WARN", color: "#facc15" },
  ERROR: { label: "ERROR", color: "#f87171" },
  DEBUG: { label: "DEBUG", color: "#818cf8" },
  SYS: { label: "SYS", color: "#38bdf8" },
};

// Mock log generator (replace with real WebSocket)
let mockInterval = null;
const MOCK_LOGS = [
  { level: "SYS", msg: "Node gpu-worker-03 connected from 192.168.1.42" },
  { level: "INFO", msg: "Job #8821 dispatched to gpu-worker-01 (RTX 4090)" },
  { level: "INFO", msg: "Training epoch 12/50 complete — loss: 0.0342" },
  { level: "DEBUG", msg: "CUDA memory allocated: 18.4 GB / 24 GB" },
  { level: "WARN", msg: "gpu-worker-02 thermal throttle detected — 91°C" },
  { level: "INFO", msg: "Checkpoint saved to /mnt/shared/checkpoints/run_8821" },
  { level: "ERROR", msg: "Job #8819 failed: OOM on node cpu-worker-05" },
  { level: "SYS", msg: "Rebalancing workload across 6 active nodes" },
  { level: "INFO", msg: "Estimated completion: 14m 32s" },
  { level: "DEBUG", msg: "Heartbeat OK — all 9 nodes responding" },
];

export default function Logs({ wsUrl }) {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [paused, setPaused] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const wsRef = useRef(null);
  const pausedRef = useRef(false);

  pausedRef.current = paused;

  useEffect(() => {
    // Real WebSocket connection
    if (wsUrl) {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onerror = () => setConnected(false);
        ws.onmessage = (e) => {
          if (pausedRef.current) return;
          try {
            const data = JSON.parse(e.data);
            addLog(data.level || "INFO", data.message || e.data);
          } catch {
            addLog("INFO", e.data);
          }
        };

        return () => ws.close();
      } catch {}
    }

    // Mock fallback
    setConnected(true);
    let i = 0;
    mockInterval = setInterval(() => {
      if (!pausedRef.current) {
        const entry = MOCK_LOGS[i % MOCK_LOGS.length];
        addLog(entry.level, entry.msg);
        i++;
      }
    }, 1200);

    return () => clearInterval(mockInterval);
  }, [wsUrl]);

  const addLog = (level, msg) => {
    const entry = {
      id: Date.now() + Math.random(),
      level,
      msg,
      ts: new Date().toLocaleTimeString("en-US", { hour12: false }),
    };
    setLogs((prev) => [...prev.slice(-499), entry]);
  };

  useEffect(() => {
    if (!paused) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, paused]);

  const filtered = filter === "ALL" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.title}>SYSTEM LOGS</span>
          <span style={{ ...styles.dot, background: connected ? "#4ade80" : "#f87171" }} />
          <span style={styles.connLabel}>{connected ? "LIVE" : "DISCONNECTED"}</span>
        </div>
        <div style={styles.controls}>
          {["ALL", ...Object.keys(LOG_LEVELS)].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                background: filter === f ? "rgba(255,255,255,0.08)" : "transparent",
                color: f === "ALL" ? "#e2e8f0" : LOG_LEVELS[f]?.color || "#e2e8f0",
                borderColor: filter === f ? (f === "ALL" ? "#e2e8f0" : LOG_LEVELS[f]?.color) : "rgba(255,255,255,0.1)",
              }}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setPaused((p) => !p)}
            style={{ ...styles.filterBtn, color: paused ? "#facc15" : "#94a3b8", borderColor: paused ? "#facc15" : "rgba(255,255,255,0.1)" }}
          >
            {paused ? "▶ RESUME" : "⏸ PAUSE"}
          </button>
          <button onClick={() => setLogs([])} style={{ ...styles.filterBtn, color: "#f87171", borderColor: "rgba(255,255,255,0.1)" }}>
            CLEAR
          </button>
        </div>
      </div>

      {/* Log stream */}
      <div style={styles.logArea}>
        {filtered.length === 0 && (
          <div style={styles.empty}>Waiting for log stream…</div>
        )}
        {filtered.map((log) => (
          <div key={log.id} style={styles.logLine}>
            <span style={styles.ts}>{log.ts}</span>
            <span style={{ ...styles.badge, background: LOG_LEVELS[log.level]?.color + "22", color: LOG_LEVELS[log.level]?.color || "#e2e8f0" }}>
              {log.level}
            </span>
            <span style={styles.msg}>{log.msg}</span>
          </div>
        ))}
        <div ref={bottomRef} />
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
    display: "flex",
    flexDirection: "column",
    height: "100%",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
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
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  title: { fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#94a3b8" },
  dot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
  connLabel: { fontSize: "10px", color: "#4ade80", letterSpacing: "0.1em" },
  controls: { display: "flex", gap: "6px", flexWrap: "wrap" },
  filterBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "4px",
    padding: "3px 10px",
    fontSize: "10px",
    fontFamily: "inherit",
    cursor: "pointer",
    letterSpacing: "0.06em",
    transition: "all 0.15s",
    fontWeight: 600,
  },
  logArea: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 0",
    scrollbarWidth: "thin",
    scrollbarColor: "#1e293b transparent",
  },
  logLine: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    padding: "3px 16px",
    fontSize: "12px",
    lineHeight: 1.6,
    transition: "background 0.1s",
  },
  ts: { color: "#334155", minWidth: "80px", fontSize: "11px" },
  badge: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "1px 6px",
    borderRadius: "3px",
    minWidth: "42px",
    textAlign: "center",
  },
  msg: { color: "#cbd5e1", fontSize: "12px", wordBreak: "break-word" },
  empty: { color: "#334155", fontSize: "12px", padding: "40px 16px", textAlign: "center" },
};
