import { useState } from "react";
import JobsProgress from "./JobsProgress";
import ResourceMonitor from "./ResourceMonitor";
import Share from "./Share";
import Receive from "./Receive";

const NAV = ["OVERVIEW", "SHARE", "RECEIVE"];

export default function Dashboard({ wsUrl }) {
  const [tab, setTab] = useState("OVERVIEW");

  return (
    <div style={styles.root}>
      <header style={styles.topbar}>
        <div style={styles.brand}>
          <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#38bdf8" strokeWidth={1.5} fill="none" />
            <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" fill="#38bdf8" opacity={0.2} />
            <circle cx={11} cy={11} r={2.5} fill="#38bdf8" />
          </svg>
          <span style={styles.brandName}>CLOUDLESS</span>
          <span style={styles.brandTag}>distributed compute</span>
        </div>

        <nav style={styles.nav}>
          {NAV.map((n) => (
            <button
              key={n}
              onClick={() => setTab(n)}
              style={{
                ...styles.navBtn,
                color: tab === n ? "#e2e8f0" : "#475569",
                borderBottom: tab === n ? "2px solid #38bdf8" : "2px solid transparent",
              }}
            >
              {n}
            </button>
          ))}
        </nav>

        <div style={styles.topRight}>
          <span style={styles.sessionDot} />
          <span style={styles.sessionLabel}>SESSION ACTIVE</span>
        </div>
      </header>

      <main style={styles.main}>
        {tab === "OVERVIEW" && (
          <div style={styles.overviewGrid}>
            <JobsProgress />
            <ResourceMonitor />
          </div>
        )}
        {tab === "SHARE"   && <Share />}
        {tab === "RECEIVE" && <Receive />}
      </main>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#060b14",
    color: "#e2e8f0",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    height: 56,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "#080d17",
    gap: 32,
    flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandName: { fontSize: 14, fontWeight: 800, letterSpacing: "0.15em", color: "#f1f5f9" },
  brandTag: { fontSize: 9, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase" },
  nav: { display: "flex", gap: 2, flex: 1 },
  navBtn: {
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    padding: "18px 14px 16px",
    fontSize: 10,
    fontFamily: "inherit",
    fontWeight: 700,
    letterSpacing: "0.1em",
    cursor: "pointer",
    transition: "color 0.15s, border-color 0.15s",
  },
  topRight: { display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" },
  sessionDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#4ade80", boxShadow: "0 0 6px #4ade80",
  },
  sessionLabel: { fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: "0.1em" },
  main: {
    flex: 1,
    padding: 24,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  overviewGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "100%",
  },
};
