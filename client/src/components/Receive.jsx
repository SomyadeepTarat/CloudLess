import { useContext, useMemo, useRef, useState } from "react";
import AppContext from "../context/AppContext";
import * as api from "../services/api";

const getNodeType = (node) => node?.capabilities?.gpu ? "GPU" : "CPU";

export default function Receive({ user }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [gpu, setGpu] = useState(false);
  const [gpuSize, setGpuSize] = useState("");
  const [suggestedGpuSize, setSuggestedGpuSize] = useState(0);
  const [recommendedRamMb, setRecommendedRamMb] = useState(null);
  const [cpuLoad, setCpuLoad] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { jobs, nodes, loading, submitNewJob } = useContext(AppContext);
  const fileInputRef = useRef(null);

  const availableNodes = useMemo(
    () =>
      Object.entries(nodes || {})
        .filter(([, node]) => node?.available_slots > 0 || node?.status !== "busy")
        .map(([id, node]) => ({ id, ...node })),
    [nodes]
  );

  const jobHistory = useMemo(() => {
    const pending = Array.isArray(jobs.pending) ? jobs.pending : [];
    const completed = Object.entries(jobs.completed || {}).map(([jobId, result]) => ({
      jobId,
      code: result.output || "Completed job",
      metadata: {},
      status: result.status || "completed",
    }));

    return [...pending, ...completed].slice(0, 8);
  }, [jobs]);

  const analyzeSelectedFile = async (file) => {
    if (!file) {
      setRecommendedRamMb(null);
      setSuggestedGpuSize(0);
      setCpuLoad("");
      return;
    }

    const code = await file.text();

    if (!code.trim()) {
      throw new Error("Uploaded file is empty");
    }

    setAnalysisLoading(true);

    try {
      const result = await api.recommendResources({
        code,
        filename: file.name,
      });

      setRecommendedRamMb(result.recommendedRamMb);
      setSuggestedGpuSize(result.recommendedRamGb);
      setCpuLoad(result.cpuLoad || "");

      if (gpu) {
        setGpuSize(String(result.recommendedRamGb));
      }
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSubmit = async () => {
    const selectedNode = availableNodes.find((node) => node.id === selectedNodeId);

    if (!selectedFile) {
      setError("Upload a Python file to submit a job");
      setSuccess("");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".py")) {
      setError("Only Python files are allowed");
      setSuccess("");
      return;
    }

    if (gpu && (parseFloat(gpuSize) <= 0 || !gpuSize)) {
      setError("GPU Size must be greater than 0GB");
      setSuccess("");
      return;
    }
    if (gpu && !suggestedGpuSize) {
      setError("Wait for file analysis to finish before requesting GPU");
      setSuccess("");
      return;
    }
    if (selectedNodeId && !selectedNode) {
      setError("Selected node is no longer available");
      setSuccess("");
      return;
    }
    if (gpu && selectedNode && !selectedNode.capabilities?.gpu) {
      setError("The selected node does not provide GPU compute");
      setSuccess("");
      return;
    }
    if (gpu && parseFloat(gpuSize) > suggestedGpuSize + 3) {
      setError(`GPU Size cannot be more than ${suggestedGpuSize + 3}GB for this file`);
      setSuccess("");
      return;
    }
    setError("");

    try {
      const jobCode = await selectedFile.text();
      const uploadedFileName = selectedFile.name;

      if (!jobCode.trim()) {
        setError("Uploaded file is empty");
        setSuccess("");
        return;
      }

      const job = await submitNewJob({
        code: jobCode,
        language: "python",
        priority: gpu ? 1 : 0,
        metadata: {
          gpu,
          gpuSize: gpu ? parseFloat(gpuSize) : 0,
          suggestedGpuSize: gpu ? suggestedGpuSize : 0,
          requestedBy: user?.username || "anonymous",
          sourceFile: uploadedFileName,
          taskLabel: uploadedFileName,
          preferredNodeId: selectedNodeId || null,
        },
      });

      setSuccess(`Queued ${uploadedFileName || job.code}`);
      setSelectedFile(null);
      setSelectedNodeId("");
      setGpu(false);
      setGpuSize("");
      setSuggestedGpuSize(0);
      setRecommendedRamMb(null);
      setCpuLoad("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message || "Unable to submit job");
      setSuccess("");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '4rem' }}>
      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 className="card-title">Submit a Job</h2>
        <p className="card-desc">
          Upload your Python file, choose a shared node if you want a specific machine, and the worker on that system will execute it.
        </p>

        <div className="form-group" style={{ alignItems: 'center' }}>
          <label className="form-label">Python File</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0] || null;
              setSelectedFile(file);
              setSuggestedGpuSize(0);
              setRecommendedRamMb(null);
              setCpuLoad("");
              setGpuSize("");
              setError("");
              setSuccess("");

              if (!file) {
                return;
              }

              if (!file.name.toLowerCase().endsWith(".py")) {
                setError("Only Python files are allowed");
                return;
              }

              try {
                await analyzeSelectedFile(file);
              } catch (err) {
                setError(err.message || "Unable to analyze the uploaded file");
              }
            }}
          />
          <button
            type="button"
            className="btn-primary cursor-target"
            style={{ marginTop: '0.5rem' }}
            onClick={() => fileInputRef.current?.click()}
          >
            Add File
          </button>
          {selectedFile && (
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center' }}>
              Selected: {selectedFile.name}
            </span>
          )}
          {analysisLoading && (
            <span style={{ color: '#d8b4fe', fontSize: '0.8rem', textAlign: 'center' }}>
              Processing file to estimate required RAM...
            </span>
          )}
          {!analysisLoading && recommendedRamMb !== null && (
            <span style={{ color: '#d8b4fe', fontSize: '0.8rem', textAlign: 'center' }}>
              Recommended RAM: {recommendedRamMb.toFixed(2)} MB{cpuLoad ? ` • CPU Load: ${cpuLoad}` : ""}
            </span>
          )}
        </div>

        <div className="checkbox-group" style={{ justifyContent: 'center' }}>
          <input
            id="gpu"
            type="checkbox"
            checked={gpu}
            onChange={(e) => {
              setGpu(e.target.checked);
              if (!e.target.checked) {
                setGpuSize("");
                setError("");
              } else if (selectedFile && suggestedGpuSize) {
                setGpuSize(String(suggestedGpuSize));
              }
            }}
            disabled={!selectedFile || analysisLoading}
          />
          <label htmlFor="gpu" className="checkbox-label">Requires GPU</label>
        </div>

        {gpu && (
          <div className="form-group" style={{ alignItems: 'center' }}>
            <span style={{ color: '#d8b4fe', fontSize: '0.8rem', textAlign: 'center' }}>
              Suggested GPU RAM: {suggestedGpuSize}GB
            </span>
            <label className="form-label">GPU Size (GB)</label>
            <input
              style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}
              placeholder="Suggested automatically"
              value={gpuSize}
              onChange={(e) => {
                const value = e.target.value;
                setGpuSize(value);

                if (!value) {
                  setError("");
                  return;
                }

                const numericValue = parseFloat(value);
                if (numericValue > 0 && numericValue <= suggestedGpuSize + 3) {
                  setError("");
                }
              }}
              type="number"
              min={suggestedGpuSize || 1}
              max={suggestedGpuSize ? suggestedGpuSize + 3 : undefined}
            />
            <span style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>
              You can request up to {suggestedGpuSize + 3}GB for now.
            </span>
          </div>
        )}

        {error && <span style={{ color: '#f87171', fontSize: '0.75rem', textAlign: 'center' }}>{error}</span>}
        {success && <span style={{ color: '#d8b4fe', fontSize: '0.75rem', textAlign: 'center' }}>{success}</span>}

        <button className="btn-primary cursor-target" style={{ background: '#36303c', color: '#b291d9' }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Job"}
        </button>
      </div>

      <div className="card" style={{ maxWidth: '1000px', width: '100%' }}>
        <h2 className="card-title">Available Nodes</h2>
        <p className="card-desc">
          Click a node to target that specific machine. If you leave it unselected, the scheduler will choose any compatible worker.
        </p>

        <div className="node-list">
          {availableNodes.length === 0 && (
            <div className="empty-state">No shared nodes are available right now.</div>
          )}
          {availableNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;

            return (
              <button
                key={node.id}
                type="button"
                className={`node-item selectable-node ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedNodeId((prev) => prev === node.id ? "" : node.id)}
              >
                <div className={`badge ${getNodeType(node) === "GPU" ? "badge-purple" : ""}`}>
                  {getNodeType(node)}
                </div>
                <div className="node-info" style={{ alignItems: 'flex-start' }}>
                  <span className="node-name">{node.id}</span>
                  <span className="node-meta">
                    {node.ram || 0}GB RAM • {node.available_slots || 0} slots • {node.capabilities?.sharedBy || node.capabilities?.hostname || "Unknown user"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {selectedNodeId && (
          <span style={{ color: '#d8b4fe', fontSize: '0.8rem', textAlign: 'center' }}>
            Selected node: {selectedNodeId}
          </span>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: '1000px' }}>
        <h3 className="section-title">Job History</h3>
        <div className="history-list">
          {jobHistory.length === 0 && (
            <div className="empty-state">Your submitted jobs will appear here once they are queued.</div>
          )}
          {jobHistory.map((job) => (
            <div key={job.jobId || job.code} className="node-item">
              <div className={`badge ${job.metadata?.gpu ? "badge-purple" : ""}`}>
                {job.metadata?.gpu ? "GPU" : "CPU"}
              </div>
              <div className="node-info">
                <span className="node-name">{job.code}</span>
                <span className="node-meta">
                  {job.metadata?.sourceFile || job.metadata?.taskLabel || "Manual task"}
                  {" • "}
                  {job.metadata?.preferredNodeId || "Auto-selected node"}
                  {" • "}
                  {job.metadata?.gpu
                    ? `${job.metadata.gpuSize || 0}GB GPU`
                    : "Standard CPU job"}
                  {" • "}
                  {job.metadata?.requestedBy || user?.username || "Unknown user"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
