import { useContext, useMemo } from "react";
import AppContext from "../context/AppContext";
import api from "../services/api";

const getNodeType = (node) =>
  node?.capabilities?.gpu ? "GPU" : "CPU";

export default function Share({ user }) {
  const { nodes } = useContext(AppContext);

  const availableNodes = useMemo(
    () =>
      Object.entries(nodes || {})
        .filter(([, node]) => node?.status !== "busy")
        .map(([id, node]) => ({ id, ...node })),
    [nodes]
  );

  const workerCommand = useMemo(
    () => `export SERVER_URL="${api.API_BASE_URL}"
export HAS_GPU=true   # or false
export MAX_WORKERS=2
python3 worker.py`,
    []
  );

  return (
    <div className="cards-container">
      <div className="card share-card">
        <div className="card-icon">⬡</div>
        <h2 className="card-title">Connect This Machine</h2>
        <p className="card-desc">
          A machine becomes a real shared node only when `worker.py` is running on it. Start the worker on the system you want to contribute.
        </p>

        <div className="form-group">
          <label className="form-label">Run this command on the machine you want to share</label>
          <pre className="command-box">{workerCommand}</pre>
          <span className="feedback success">
            Logged in as @{user?.username || "anonymous"}. Set `HAS_GPU=true` on GPU systems before starting the worker.
          </span>
        </div>
      </div>

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
                    {node.capabilities?.sharedBy || node.capabilities?.hostname || "unknown"}
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
