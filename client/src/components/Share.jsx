import { useState } from "react";

const AVAILABLE_NODES = [
  { id: "gpu-worker-03", type: "GPU", gpu: "A100 80G", ram: "64GB", status: "idle",   owner: "rahul_k" },
  { id: "cpu-worker-02", type: "CPU", gpu: "—",        ram: "32GB", status: "idle",   owner: "priya_m" },
  { id: "cpu-worker-04", type: "CPU", gpu: "—",        ram: "16GB", status: "idle",   owner: "zara_x" },
];

export default function Share() {
  const [sharing, setSharing] = useState(false);
  const [ram, setRam] = useState("");
  const [hasGpu, setHasGpu] = useState(false);
  const [gpuName, setGpuName] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    setRegistered(true);
    setSharing(true);
  };

  const handleStop = () => {
    setRegistered(false);
    setSharing(false);
  };

  return (
    <div style={styles.container}>

      {/* Your machine */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Share Your Machine</h2>
        <p style={styles.cardDesc}>
          Register your device as a worker node. Jobs from the queue will be sent to your machine when you're idle.
        </p>

        {!sharing ? (
          <>
            <div style={styles.field}>
              <label style={styles.label}>How much RAM to share (GB)</label>
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
                id="hasgpu"
                type="checkbox"
                checked={hasGpu}
                onChange={(e) => setHasGpu(e.target.checked)}
                style={{ accentColor: "#818cf8", width: 14, height: 14 }}
              />
              <label htmlFor="hasgpu" style={styles.checkLabel}>I have a GPU</label>
            </div>

            {hasGpu && (
              <div style={styles.field}>
                <label style={styles.label}>GPU name</label>
                <input
                  style={styles.input}
                  placeholder="e.g. RTX 3060"
                  value={gpuName}
                  onChange={(e) => setGpuName(e.target.value)}
                />
              </div>
            )}

            <button style={styles.btn} onClick={handleRegister}>
              Start Sharing
            </button>
          </>
        ) : (
          <div style={styles.activeBox}>
            <div style={styles.activeRow}>
              <span style={styles.activeDot} />
              <span style={styles.activeLabel}>Your machine is live and accepting jobs</span>
            </div>
            <div style={styles.activeDetails}>
              <span style={styles.detailItem}>RAM: {ram || "?"}GB</span>
              {hasGpu && <span style={styles.detailItem}>GPU: {gpuName || "unknown"}</span>}
            </div>
            <button style={styles.stopBtn} onClick={handleStop}>Stop Sharing</button>
          </div>
        )}
      </div>

      {/* Available nodes from others */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Available Nodes</h2>
        <p style={styles.cardDesc}>Other machines currently idle and ready to take jobs.</p>
        <div style={styles.nodeList}>
          {AVAILABLE_NODES.map((node) => (
            <div key={node.id} style={styles.nodeRow}>
              <div style={styles.nodeLeft}>
                <span style={{
                  ...styles.typeTag,
                  color: node.type === "GPU" ? "#818cf8" : "#fb923c",
                  borderColor: (node.type === "GPU" ? "#818cf8" : "#fb923c") + "44",
                  background: (node.type === "GPU" ? "#818cf8" : "#fb923c") + "11",
                }}>
                  {node.type}
                </span>
                <div>
                  <div style={styles.nodeId}>{node.id}</div>
                  <div style={styles.nodeMeta}>
                    {node.gpu !== "—" && <span>{node.gpu} · </span>}
                    <span>{node.ram} RAM</span>
                    <span> · {node.owner}</span>
                  </div>
                </div>
              </div>
              <span style={styles.idleTag}>idle</span>
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
  label: { fontSize: 10, color: "#94a3b8", letterSpacing: "0.08em", fontWeight: 600 },
  input: {
    background: "#060b14",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    padding: "8px 12px",
    color: "#e2e8f0",
    fontSize: 12,
    fontFamily: "inherit",
    outline: "none",
  },
  checkRow: { display: "flex", alignItems: "center", gap: 8 },
  checkLabel: { fontSize: 11, color: "#94a3b8", cursor: "pointer" },
  btn: {
    background: "#4ade80",
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
  activeBox: {
    background: "#060b14",
    border: "1px solid #4ade8033",
    borderRadius: 8,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  activeRow: { display: "flex", alignItems: "center", gap: 8 },
  activeDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#4ade80", boxShadow: "0 0 6px #4ade80",
  },
  activeLabel: { fontSize: 12, color: "#4ade80", fontWeight: 600 },
  activeDetails: { display: "flex", gap: 16 },
  detailItem: { fontSize: 11, color: "#475569" },
  stopBtn: {
    background: "transparent",
    border: "1px solid #f8717144",
    color: "#f87171",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 10,
    fontFamily: "inherit",
    fontWeight: 700,
    letterSpacing: "0.08em",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  nodeList: { display: "flex", flexDirection: "column", gap: 1 },
  nodeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  nodeLeft: { display: "flex", alignItems: "center", gap: 10 },
  typeTag: {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
    padding: "2px 6px", borderRadius: 3, border: "1px solid",
  },
  nodeId: { fontSize: 11, color: "#94a3b8", fontWeight: 600 },
  nodeMeta: { fontSize: 10, color: "#334155", marginTop: 2 },
  idleTag: { fontSize: 10, color: "#38bdf8", fontWeight: 700, letterSpacing: "0.08em" },
};
