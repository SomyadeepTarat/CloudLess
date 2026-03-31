import { useContext, useMemo, useState } from "react";
import AppContext from "../context/AppContext";

const getNodeType = (node) =>
  node?.capabilities?.gpu ? "GPU" : "CPU";

export default function Share({ user }) {
  const [ram, setRam] = useState("");
  const [hasGpu, setHasGpu] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { nodes, loading, registerSharedNode } =
    useContext(AppContext);

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
      const workerId = `${user?.username || "worker"}-${
        hasGpu ? "gpu" : "cpu"
      }-${Math.round(parseFloat(ram))}gb`;

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
      {/* Share your machine */}
      <div className="card share-card">
        <div className="card-icon">⬡</div>
        <h2 className="card-title">Share Your Machine</h2>
        <p className="card-desc">
          Register as a worker node. Idle jobs from the queue will run on your machine.
        </p>

        <div className="form-group">
          <label className="form-label">RAM to share (GB)</label>
          <div className="input-wrapper">
            <input
              placeholder="e.g. 8"
              value={ram}
              onChange={(e) => {
                setRam(e.target.value);
                if (parseFloat(e.target.value) > 0) setError("");
              }}
              type="number"
              min="1"
            />
            <span className="input-unit">GB</span>
          </div>

          {error && <span className="feedback error">{error}</span>}
          {success && <span className="feedback success">{success}</span>}
        </div>

        <div className="checkbox-group">
          <input
            id="hasgpu"
            type="checkbox"
            checked={hasGpu}
            onChange={(e) => setHasGpu(e.target.checked)}
          />
          <label htmlFor="hasgpu" className="checkbox-label">
            I have a GPU
          </label>
          {hasGpu && <span className="gpu-tag">+priority</span>}
        </div>

        <button
          className="btn-primary cursor-target"
          onClick={handleStartSharing}
          disabled={loading}
        >
          {loading ? "Starting..." : "Start Sharing"}
        </button>
      </div>

      {/* Available nodes */}
      <div className="card nodes-card">
        <div className="card-icon">◈</div>

        <div className="nodes-header">
          <h2 className="card-title">Available Nodes</h2>
          {availableNodes.length > 0 && (
            <span className="nodes-count">
              {availableNodes.length} idle
            </span>
          )}
        </div>

        <p className="card-desc">
          Machines currently idle and ready to accept jobs.
        </p>

        <div className="node-list">
          {availableNodes.length === 0 ? (
            <div className="empty-state">
              No idle nodes yet. Be the first to share.
            </div>
          ) : (
            availableNodes.map((node) => (
              <div key={node.id} className="node-item">
                <div
                  className={`badge ${
                    getNodeType(node) === "GPU"
                      ? "badge-purple"
                      : ""
                  }`}
                >
                  {getNodeType(node)}
                </div>

                <div className="node-info">
                  <span className="node-name">{node.id}</span>
                  <span className="node-meta">
                    {node.ram || 0}GB RAM · @
                    {node.capabilities?.sharedBy || "unknown"}
                  </span>
                </div>

                <span className="node-status-dot" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}