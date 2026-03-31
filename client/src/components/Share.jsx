import { useContext, useMemo } from "react";
import AppContext from "../context/AppContext";

const getNodeType = (node) =>
  node?.capabilities?.gpu ? "GPU" : "CPU";

export default function Share({ user }) {
  const { nodes, stopSharedNode, setSharedByOwner, loading } = useContext(AppContext);
  const owner = user?.username || "anonymous";

  const allOwnerNodes = useMemo(
    () =>
      Object.entries(nodes || {})
        .filter(([, node]) => (node?.capabilities?.sharedBy || "") === owner)
        .map(([id, node]) => ({ id, ...node })),
    [nodes, owner]
  );

  const availableNodes = useMemo(
    () =>
      Object.entries(nodes || {})
        .filter(([, node]) => node?.published && node?.status !== "busy")
        .map(([id, node]) => ({ id, ...node })),
    [nodes]
  );

  const mySharedNodes = useMemo(
    () => allOwnerNodes.filter((node) => node.published),
    [allOwnerNodes]
  );
  return (
    <div className="cards-container">
      <div className="card share-card">
        <div className="card-icon">⬡</div>
        <h2 className="card-title">Share Your Machine</h2>
        <p className="card-desc">
          Click Share to publish your connected machine to everyone using the backend. Click Stop Sharing to hide it again.
        </p>

        <div className="form-group">
          {allOwnerNodes.length > 0 ? (
            <span className="feedback success">
              Connected now: {allOwnerNodes.length} machine{allOwnerNodes.length > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="feedback error">
              No connected worker found for @{owner}. Start `worker.py` with `WORKER_OWNER="{owner}"` first.
            </span>
          )}
        </div>

        <div className="checkbox-group" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn-primary cursor-target"
            disabled={loading || allOwnerNodes.length === 0}
            onClick={() => setSharedByOwner(owner, true)}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
          <button
            type="button"
            className="btn-primary cursor-target"
            disabled={loading || mySharedNodes.length === 0}
            onClick={() => setSharedByOwner(owner, false)}
          >
            {loading ? "Stopping..." : "Stop Sharing"}
          </button>
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
                {node.capabilities?.sharedBy === owner && (
                  <button
                    type="button"
                    className="btn-primary cursor-target"
                    style={{ marginTop: 0, padding: "0.45rem 0.9rem", fontSize: "0.75rem" }}
                    onClick={() => stopSharedNode(node.id)}
                  >
                    Stop Sharing
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
