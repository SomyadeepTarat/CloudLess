import { useContext, useMemo, useState } from "react";
import AppContext from "../context/AppContext";

const getNodeType = (node) => node?.capabilities?.gpu ? "GPU" : "CPU";

export default function Share({ user }) {
  const [ram, setRam] = useState("");
  const [hasGpu, setHasGpu] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { nodes, loading, registerSharedNode } = useContext(AppContext);

  const availableNodes = useMemo(
    () =>
      Object.entries(nodes || {})
        .filter(([, node]) => node?.status !== "busy")
        .map(([id, node]) => ({ id, ...node })),
    [nodes]
  );

  const handleStartSharing = async () => {
    if (parseFloat(ram) <= 0 || !ram) {
      setError("RAM must be greater than 0GB");
      setSuccess("");
      return;
    }
    setError("");

    try {
      const workerId = `${user?.username || "worker"}-${hasGpu ? "gpu" : "cpu"}-${Math.round(parseFloat(ram))}gb`;
      await registerSharedNode({
        workerId,
        ram: parseFloat(ram),
        hasGpu,
        username: user?.username || "anonymous",
      });
      setSuccess(`Machine shared as ${workerId}`);
      setRam("");
      setHasGpu(false);
    } catch (err) {
      setError(err.message || "Unable to start sharing");
      setSuccess("");
    }
  };

  return (
    <div className="cards-container">
      <div className="card">
        <h2 className="card-title">Share Your Machine</h2>
        <p className="card-desc">
          Register as a worker node. Idle jobs from the queue will run on your machine.
        </p>

        <div className="form-group">
          <label className="form-label">RAM to share (GB)</label>
          <input
            placeholder="eg 8"
            value={ram}
            onChange={(e) => {
              setRam(e.target.value);
              if (parseFloat(e.target.value) > 0) setError("");
            }}
            type="number"
          />
          {error && <span style={{ color: '#f87171', fontSize: '0.75rem', textAlign: 'center' }}>{error}</span>}
          {success && <span style={{ color: '#d8b4fe', fontSize: '0.75rem', textAlign: 'center' }}>{success}</span>}
        </div>

        <div className="checkbox-group">
          <input
            id="hasgpu"
            type="checkbox"
            checked={hasGpu}
            onChange={(e) => setHasGpu(e.target.checked)}
          />
          <label htmlFor="hasgpu" className="checkbox-label">I have a GPU</label>
        </div>

        <button className="btn-primary" onClick={handleStartSharing} disabled={loading}>
          {loading ? "STARTING..." : "START SHARING"}
        </button>
      </div>

      <div className="card">
        <h2 className="card-title">Available Nodes</h2>
        <p className="card-desc">Machines currently idle and ready to accept jobs.</p>
        
        <div className="node-list">
          {availableNodes.length === 0 && (
            <div className="empty-state">No idle nodes yet. Share this machine to make the cluster available.</div>
          )}
          {availableNodes.map((node) => (
            <div key={node.id} className="node-item">
              <div className={`badge ${getNodeType(node) === "GPU" ? "badge-purple" : ""}`}>
                {getNodeType(node)}
              </div>
              <div className="node-info">
                <span className="node-name">{node.id}</span>
                <span className="node-meta">
                  {node.ram || 0}GB RAM • {node.capabilities?.sharedBy || "Unknown user"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
