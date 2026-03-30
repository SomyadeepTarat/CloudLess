import { useState, useEffect } from "react";

const AVAILABLE_NODES = [
  { id: "gpu-worker-03", type: "GPU", gpu: "A100 80G", ram: "64GB", status: "idle", owner: "rahul_k" },
  { id: "cpu-worker-02", type: "CPU", gpu: "—",        ram: "32GB", status: "idle", owner: "priya_m" },
  { id: "cpu-worker-04", type: "CPU", gpu: "—",        ram: "16GB", status: "idle", owner: "zara_x" },
];

export default function Share() {
  const [sharing, setSharing] = useState(false);
  const [ram, setRam] = useState("");
  const [hasGpu, setHasGpu] = useState(false);
  const [gpuName, setGpuName] = useState("");
  const [totalRAM, setTotalRAM] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Detect total RAM if available
    const total = navigator.deviceMemory;
    if (total) {
      setTotalRAM(total);
    }
  }, []);

  const validateRAM = (value) => {
    const ramNum = parseFloat(value);
    if (isNaN(ramNum)) return "Please enter a valid number";
    if (ramNum <= 0) return "RAM must be greater than 0";
    if (totalRAM && ramNum > totalRAM) {
      return `You can't share more than your total RAM (${totalRAM} GB)`;
    }
    if (ramNum > 32) return "Maximum shareable RAM is 32 GB per node";
    return null;
  };

  const handleRegister = () => {
    const validationError = validateRAM(ram);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSharing(true);
    // Here you would also send the registration to your backend
  };

  const handleStop = () => { 
    setSharing(false); 
    setRam(""); 
    setGpuName(""); 
    setHasGpu(false); 
    setError("");
  };

  return (
    <div style={styles.page}>

      {/* Share your machine */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Share your machine</h2>
        <p style={styles.cardDesc}>Register as a worker node. Idle jobs from the queue will run on your machine.</p>

        {!sharing ? (
          <>
            <div style={styles.field}>
              <label style={styles.label}>RAM to share (GB)</label>
              <div style={styles.inputGroup}>
                <input
                  style={{...styles.input, borderColor: error ? "#f87171" : "rgba(255,255,255,0.1)"}}
                  placeholder={`e.g., ${totalRAM ? Math.floor(totalRAM / 2) : 4}`}
                  value={ram}
                  onChange={(e) => {
                    setRam(e.target.value);
                    if (error) setError("");
                  }}
                  type="number"
                  min="0.5"
                  max={totalRAM || 32}
                  step="0.5"
                />
              </div>
              {error && <p style={styles.errorText}>{error}</p>}
              {totalRAM && !error && (
                <p style={styles.hint}>
                  💡 Your system has {totalRAM} GB total. We recommend sharing {Math.floor(totalRAM / 2)}-{Math.floor(totalRAM * 0.7)} GB
                </p>
              )}
            </div>

            <div style={styles.checkRow}>
              <input
                id="hasgpu"
                type="checkbox"
                checked={hasGpu}
                onChange={(e) => setHasGpu(e.target.checked)}
                style={{ accentColor: "#38bdf8", width: 14, height: 14 }}
              />
              <label htmlFor="hasgpu" style={styles.checkLabel}>I have a GPU</label>
            </div>

            {hasGpu && (
              <div style={styles.field}>
                <label style={styles.label}>GPU model</label>
                <input
                  style={styles.input}
                  placeholder="e.g. RTX 3060"
                  value={gpuName}
                  onChange={(e) => setGpuName(e.target.value)}
                />
              </div>
            )}

            <button style={styles.btnPrimary} onClick={handleRegister}>
              Start sharing
            </button>
          </>
        ) : (
          <div style={styles.activeBox}>
            <div style={styles.activeHeader}>
              <span style={styles.greenDot} />
              <span style={styles.activeTitle}>Your machine is live</span>
            </div>
            <div style={styles.activeMeta}>
              <span style={styles.metaPill}>RAM: {ram} GB</span>
              {hasGpu && <span style={styles.metaPill}>GPU: {gpuName || "unknown"}</span>}
            </div>
            <button style={styles.btnDanger} onClick={handleStop}>Stop sharing</button>
          </div>
        )}
      </div>

      {/* Available nodes */}
      <div style={styles.card}>
        <div style={styles.nodesHeader}>
          <h2 style={styles.cardTitle}>Available nodes</h2>
          <span style={styles.countBadge}>{AVAILABLE_NODES.length} idle</span>
        </div>
        <p style={styles.cardDesc}>Machines currently idle and ready to accept jobs.</p>

        <div style={styles.nodeList}>
          {AVAILABLE_NODES.map((node) => (
            <div key={node.id} style={styles.nodeRow}>
              <span style={{
                ...styles.typeBadge,
                background: node.type === "GPU" ? "#818cf822" : "#fb923c22",
                color: node.type === "GPU" ? "#818cf8" : "#fb923c",
              }}>
                {node.type}
              </span>
              <div style={styles.nodeInfo}>
                <span style={styles.nodeId}>{node.id}</span>
                <span style={styles.nodeMeta}>
                  {node.gpu !== "—" ? `${node.gpu} · ` : ""}{node.ram} · @{node.owner}
                </span>
              </div>
              <span style={styles.idleBadge}>● idle</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "row",
    gap: 24,
    width: "100%",
    justifyContent: "center",
    flexWrap: "wrap",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  card: {
    flex: "1 1 320px",
    maxWidth: 420,
    background: "#0a0f1a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    textAlign: "center",
  },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.04em" },
  cardDesc: { margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.6 },
  field: { display: "flex", flexDirection: "column", gap: 6, width: "100%" },
  label: { fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textAlign: "left" },
  inputGroup: {
    display: "flex",
    gap: 8,
    width: "100%",
  },
  input: {
    background: "#060b14",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    color: "#e2e8f0",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  errorText: {
    fontSize: 11,
    color: "#f87171",
    textAlign: "left",
    marginTop: 4,
  },
  hint: {
    fontSize: 10,
    color: "#475569",
    textAlign: "left",
    marginTop: 4,
  },
  checkRow: { display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start" },
  checkLabel: { fontSize: 12, color: "#94a3b8", cursor: "pointer" },
  btnPrimary: {
    background: "#38bdf8",
    color: "#060b14",
    border: "none",
    borderRadius: 8,
    padding: "9px 24px",
    fontSize: 12,
    fontWeight: 800,
    fontFamily: "inherit",
    letterSpacing: "0.08em",
    cursor: "pointer",
    marginTop: 4,
  },
  activeBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    background: "#060b14",
    border: "1px solid #4ade8033",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    boxSizing: "border-box",
  },
  activeHeader: { display: "flex", alignItems: "center", gap: 8 },
  greenDot: {
    width: 10, height: 10, borderRadius: "50%",
    background: "#4ade80", boxShadow: "0 0 6px #4ade80",
  },
  activeTitle: { fontSize: 13, fontWeight: 600, color: "#4ade80" },
  activeMeta: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  metaPill: {
    fontSize: 11,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 99,
    padding: "3px 12px",
    color: "#94a3b8",
  },
  btnDanger: {
    background: "transparent",
    border: "1px solid #f8717144",
    color: "#f87171",
    borderRadius: 8,
    padding: "6px 16px",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  nodesHeader: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center" },
  countBadge: {
    fontSize: 11,
    fontWeight: 700,
    background: "#4ade8022",
    color: "#4ade80",
    border: "1px solid #4ade8044",
    borderRadius: 99,
    padding: "2px 10px",
  },
  nodeList: { display: "flex", flexDirection: "column", gap: 2, width: "100%" },
  nodeRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  typeBadge: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "3px 8px",
    borderRadius: 99,
    flexShrink: 0,
  },
  nodeInfo: { display: "flex", flexDirection: "column", gap: 2, flex: 1, textAlign: "left" },
  nodeId: { fontSize: 11, color: "#94a3b8", fontWeight: 600 },
  nodeMeta: { fontSize: 10, color: "#334155" },
  idleBadge: { fontSize: 10, color: "#4ade80", fontWeight: 700, flexShrink: 0 },
};