import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface SignalStats {
  totalSignals: number;
  totalSources: number;
  totalScans: number;
  byType: { type: string; count: number }[];
}

interface Signal {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  strength: number;
  detectedAt: string;
  prospect: { id: string; name: string };
  source: { id: string; name: string; type: string };
}

export function SignalsPage() {
  const [stats, setStats] = useState<SignalStats | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    api("/signals/stats").then(setStats);
    api("/signals?limit=50").then((d) => setSignals(d.signals));
  }, []);

  const typeColors: Record<string, string> = {
    JOB_POSTING: "#2563eb",
    FUNDING_ROUND: "#059669",
    EXPANSION: "#7c3aed",
    LEADERSHIP_HIRE: "#d97706",
    LAYOFF_RECOVERY: "#dc2626",
    CONTRACT_WIN: "#0891b2",
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 20px" }}>Signal Detection</h1>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Signals" value={stats.totalSignals} />
          <StatCard label="Active Sources" value={stats.totalSources} />
          <StatCard label="Scan Runs" value={stats.totalScans} />
          {stats.byType.map((t) => (
            <StatCard key={t.type} label={t.type.replace(/_/g, " ")} value={t.count} color={typeColors[t.type]} />
          ))}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb", textAlign: "left" }}>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Strength</th>
              <th style={thStyle}>Detected</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={tdStyle}>
                  <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: `${typeColors[s.type] || "#666"}20`, color: typeColors[s.type] || "#666" }}>
                    {s.type.replace(/_/g, " ")}
                  </span>
                </td>
                <td style={tdStyle}>{s.title}</td>
                <td style={tdStyle}>{s.prospect.name}</td>
                <td style={tdStyle}>{s.source.name}</td>
                <td style={tdStyle}>
                  <div style={{ width: 60, background: "#eee", borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${s.strength * 100}%`, background: "#4f46e5", borderRadius: 4, height: 6 }} />
                  </div>
                </td>
                <td style={tdStyle}>{new Date(s.detectedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {signals.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#666" }}>
                  No signals detected yet. Configure sources and run scans to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <p style={{ margin: 0, fontSize: 12, color: "#666", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 700, color: color || "#1a1a2e" }}>{value}</p>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "#666", textTransform: "uppercase" };
const tdStyle: React.CSSProperties = { padding: "10px 12px" };
