import { useState } from "react";

const SAMPLE_JOBS = [
  { id: "8821", name: "train.py", status: "running", submitted: "11:04" },
  { id: "8820", name: "inference.py", status: "complete", submitted: "10:41" },
  { id: "8819", name: "preprocess.py", status: "failed", submitted: "11:09" },
];

function analyzeScript(scriptName) {
  const name = scriptName.toLowerCase();
  let suggested_ram = 2;
  let reason = "standard script";

  if (name.includes("train")) {
    suggested_ram = 8;
    reason = "training scripts typically need 8GB+";
  }
  if (name.includes("transformer") || name.includes("bert") || name.includes("gpt")) {
    suggested_ram = 16;
    reason = "transformer models typically need 16GB+";
  }
  if (name.includes("diffusion") || name.includes("stable")) {
    suggested_ram = 16;
    reason = "diffusion models typically need 16GB+";
  }
  if (name.includes("preprocess") || name.includes("data")) {
    suggested_ram = 4;
    reason = "data processing detected";
  }
  if (name.includes("inference") || name.includes("predict")) {
    suggested_ram = 4;
    reason = "inference is lighter than training";
  }

  return { suggested_ram, reason };
}

function extractFeatures(code) {
  return {
    code_length: code.length,
    loops: (code.match(/for |while /g) || []).length,
    functions: (code.match(/def /g) || []).length,
    function_calls: (code.match(/\w+\(/g) || []).length,
    lists: (code.match(/\[.*?\]/g) || []).length,
    dicts: (code.match(/{.*?}/g) || []).length,
    conditions: (code.match(/if /g) || []).length,
    classes: (code.match(/class /g) || []).length,
    file_io_ops: (code.match(/open\(/g) || []).length,
    recursion_depth: 0,
    uses_numpy: code.includes("numpy") ? 1 : 0,
    uses_pandas: code.includes("pandas") ? 1 : 0,
    uses_torch: code.includes("torch") ? 1 : 0,
    uses_tensorflow: code.includes("tensorflow") ? 1 : 0,
  };
}

export default function Receive() {
  const [script, setScript] = useState("");
  const [fileName, setFileName] = useState("");
  const [features, setFeatures] = useState(null);
  const [ram, setRam] = useState("");
  const [gpu, setGpu] = useState(false);
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [submitted, setSubmitted] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const handleScriptChange = (val) => {
    setScript(val);
    if (val.trim()) {
      const result = analyzeScript(val);
      setSuggestion(result);
      setRam(String(result.suggested_ram));
    } else {
      setSuggestion(null);
      setRam("");
    }
  };

  const handleSubmit = () => {
    if (!script.trim()) return;
    const newJob = {
      id: String(Math.floor(Math.random() * 9000) + 1000),
      name: script,
      status: "queued",
      submitted: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
    };
    setJobs((prev) => [newJob, ...prev]);
    setScript("");
    setRam("");
    setGpu(false);
    setSuggestion(null);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setFileName(file.name);

  const reader = new FileReader();

  reader.onload = async (event) => {
    const code = event.target.result;

    // ✅ extract features
    const extracted = extractFeatures(code);
    setFeatures(extracted);

    console.log("SENDING:", extracted);

    try {
      // ✅ send to backend
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(extracted),
      });

      const data = await res.json();

      console.log("RESPONSE:", data);

      // ✅ update RAM field
      if (data.predicted_ram) {
        setRam(String(Math.round(data.predicted_ram)));
      }

    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  reader.readAsText(file);
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Submit a Job</h2>
        <p style={styles.cardDesc}>Enter your script name and resource needs. It'll be picked up by an available node.</p>

        <div style={styles.field}>
          <label style={styles.label}>Script / Task</label>
          <input
  type="file"
  accept=".py"
  onChange={handleFileUpload}
  style={styles.input}
/>

{features && (
  <pre style={{ fontSize: 10, color: "#38bdf8" }}>
    {JSON.stringify(features, null, 2)}
  </pre>
)}

{fileName && (
  <div style={{ fontSize: 12, color: "#94a3b8" }}>
    Selected: {fileName}
  </div>
)}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>RAM needed (GB)</label>
          <input
            style={styles.input}
            placeholder="e.g. 8"
            value={ram}
            onChange={(e) => setRam(e.target.value)}
            type="number"
          />
          {suggestion && (
            <div style={styles.suggestion}>
              <span>💡</span>
              <span>suggested <strong style={{ color: "#38bdf8" }}>{suggestion.suggested_ram}GB</strong> — {suggestion.reason}</span>
            </div>
          )}
        </div>

        <div style={styles.checkRow}>
          <input
            id="gpu"
            type="checkbox"
            checked={gpu}
            onChange={(e) => setGpu(e.target.checked)}
            style={{ accentColor: "#38bdf8", width: 14, height: 14 }}
          />
          <label htmlFor="gpu" style={styles.checkLabel}>Requires GPU</label>
        </div>

        <button style={styles.btn} onClick={handleSubmit}>
          Submit Job
        </button>

        {submitted && <p style={styles.successMsg}>✓ Job added to queue</p>}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Your Jobs</h2>
        {jobs.length === 0 && <p style={styles.cardDesc}>No jobs yet.</p>}
        <div style={styles.jobList}>
          {jobs.map((job) => (
            <div key={job.id} style={styles.jobRow}>
              <div>
                <span style={styles.jobName}>{job.name}</span>
                <span style={styles.jobId}> #{job.id}</span>
              </div>
              <div style={styles.jobRight}>
                <span style={styles.jobTime}>{job.submitted}</span>
                <span style={{ ...styles.jobStatus || "#94a3b8" }}>
                  {job.status}
                </span>
              </div>
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
  label: { fontSize: 14, color: "#94a3b8", letterSpacing: "0.08em", fontWeight: 600 },
  input: {
    background: "#060b14",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    padding: "8px 12px",
    color: "#e2e8f0",
    fontSize: 19,
    fontFamily: "inherit",
    outline: "none",
  },
  suggestion: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    color: "#475569",
    padding: "6px 10px",
    background: "#38bdf811",
    border: "1px solid #38bdf822",
    borderRadius: 6,
  },
  checkRow: { display: "flex", alignItems: "center", gap: 8 },
  checkLabel: { fontSize: 14, color: "#94a3b8", cursor: "pointer" },
  btn: {
    background: "#38bdf8",
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
  successMsg: { margin: 0, fontSize: 14, color: "#4ade80" },
  jobList: { display: "flex", flexDirection: "column", gap: 1 },
  jobRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  jobName: { fontSize: 19, color: "#e2e8f0", fontWeight: 600 },
  jobId: { fontSize: 10, color: "#475569" },
  jobRight: { display: "flex", alignItems: "center", gap: 12 },
  jobTime: { fontSize: 10, color: "#334155" },
  jobStatus: { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" },
};
