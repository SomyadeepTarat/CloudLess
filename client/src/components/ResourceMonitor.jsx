import { useState, useEffect } from "react";

const MOCK_NODES = [
  { id: "gpu-worker-01", type: "GPU", gpu: "RTX 4090", vram: 24, gpuUtil: 94, cpuUtil: 41, memUtil: 78, status: "busy",   jobs: 1 },
  { id: "cpu-worker-01", type: "CPU", gpu: "—",        vram: 0,  gpuUtil: 0,  cpuUtil: 71, memUtil: 58, status: "busy",   jobs: 2 },
];

function MiniGauge({ value, color, label }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <div style={gaugeStyles.wrap}>
      <svg width={52} height={52} viewBox="0 0 52 52">
        <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
        <circle
          cx={26} cy={26} r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
          style={{ filter: `drop-shadow(0 0 4px ${color}88)`, transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x={26} y={30} textAnchor="middle" fontSize={10} fill={color} fontFamily="'JetBrains Mono', monospace" fontWeight={700}>
          {value}%
        </text>
      </svg>
      <span style={gaugeStyles.label}>{label}</span>
    </div>
  );
}

const gaugeStyles = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  label: { fontSize: 9, color: "#475569", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" },
};

function NodeCard({ node }) {
  const statusColor = { busy: "#4ade80", idle: "#38bdf8", offline: "#475569" }[node.status];
  const typeColor = node.type === "GPU" ? "#818cf8" : "#fb923c";

  return (
    <div style={{ ...styles.card, opacity: node.status === "offline" ? 0.5 : 1 }}>
      <div style={styles.cardHeader}>
        <div style={styles.cardLeft}>
          <span style={{ ...styles.typeTag, color: typeColor, borderColor: typeColor + "44", background: typeColor + "11" }}>{node.type}</span>
          <span style={styles.nodeId}>{node.id}</span>
        </div>
        <div style={styles.cardRight}>
          <span style={{ ...styles.statusDot, background: statusColor, boxShadow: node.status === "busy" ? `0 0 6px ${statusColor}` : "none" }} />
          <span style={{ fontSize: 10, color: statusColor, fontWeight: 700, letterSpacing: "0.08em" }}>{node.status.toUpperCase()}</span>
          {node.jobs > 0 && <span style={styles.jobCount}>{node.jobs} job{node.jobs > 1 ? "s" : ""}</span>}
        </div>
      </div>

      {node.gpu !== "—" && <div style={styles.gpuLabel}>{node.gpu} · {node.vram}GB VRAM</div>}

      <div style={styles.gauges}>
        <MiniGauge value={node.cpuUtil} color="#fb923c" label="CPU" />
        {node.type === "GPU" && <MiniGauge value={node.gpuUtil} color="#818cf8" label="GPU" />}
        <MiniGauge value={node.memUtil} color="#38bdf8" label="MEM" />
      </div>
    </div>
  );
}

export default function ResourceMonitor({ nodes: propNodes }) {
  const [nodes, setNodes] = useState(propNodes || MOCK_NODES);

  useEffect(() => {
    if (propNodes) return;
    const t = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) =>
          n.status === "offline"
            ? n
            : {
                ...n,
                cpuUtil: Math.min(99, Math.max(2, n.cpuUtil + (Math.random() - 0.5) * 4)),
                gpuUtil: n.type === "GPU" ? Math.min(99, Math.max(2, n.gpuUtil + (Math.random() - 0.5) * 3)) : 0,
                memUtil: Math.min(99, Math.max(2, n.memUtil + (Math.random() - 0.5) * 2)),
              }
        )
      );
    }, 1500);
    return () => clearInterval(t);
  }, [propNodes]);

  const online = nodes.filter((n) => n.status !== "offline").length;
  const busy = nodes.filter((n) => n.status === "busy").length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>RESOURCE MONITOR</span>
        <div style={styles.summary}>
          <span style={{ color: "#4ade80", fontSize: 14, fontWeight: 700 }}>{online} online</span>
          <span style={{ color: "#94a3b8", fontSize: 14 }}>·</span>
          <span style={{ color: "#facc15", fontSize: 14, fontWeight: 700 }}>{busy} busy</span>
          <span style={{ color: "#94a3b8", fontSize: 14 }}>·</span>
          <span style={{ color: "#475569", fontSize: 14 }}>{nodes.length - online} offline</span>
        </div>
      </div>
      <div style={styles.grid}>
        {nodes.map((n) => (
          <NodeCard key={n.id} node={{ ...n, cpuUtil: Math.round(n.cpuUtil), gpuUtil: Math.round(n.gpuUtil), memUtil: Math.round(n.memUtil) }} />
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
    gap: 12,
    flexWrap: "wrap",
  },
  title: { fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#94a3b8" },
  grid: {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-evenly",
  alignItems: "flex-start",
  gap: 12,
  overflowY: "auto",
  flex: 1,
  scrollbarWidth: "thin",
  scrollbarColor: "#1e293b transparent",
},
  card: {
    background: "#0a0f1a",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardLeft: { display: "flex", alignItems: "center", gap: 8 },
  typeTag: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "2px 6px",
    borderRadius: 3,
    border: "1px solid",
  },
  nodeId: { fontSize: 11, color: "#94a3b8", fontWeight: 600 },
  cardRight: { display: "flex", alignItems: "center", gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: "50%" },
  jobCount: {
    fontSize: 9,
    background: "rgba(255,255,255,0.06)",
    color: "#94a3b8",
    padding: "1px 6px",
    borderRadius: 3,
    fontWeight: 600,
  },
  gpuLabel: { fontSize: 10, color: "#475569" },
  gauges: { display: "flex", gap: 16, justifyContent: "flex-start" },
};
