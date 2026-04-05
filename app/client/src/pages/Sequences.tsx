import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Sequence {
  id: string;
  name: string;
  status: string;
  steps: any[];
  _count: { enrollments: number };
  createdAt: string;
}

export function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const load = () => {
    setLoading(true);
    api("/sequences")
      .then((d) => setSequences(d.sequences))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await api("/sequences", {
      method: "POST",
      body: JSON.stringify({
        name,
        steps: [
          { order: 1, subject: "Introduction from {{contactName}}", body: "Hi {{contactName}},\n\nI noticed {{name}} has been growing...", delayDays: 0 },
          { order: 2, subject: "Quick follow-up", body: "Hi {{contactName}},\n\nJust checking in...", delayDays: 3 },
          { order: 3, subject: "One more thing", body: "Hi {{contactName}},\n\nI wanted to share a case study...", delayDays: 5 },
        ],
      }),
    });
    setName("");
    setShowForm(false);
    load();
  };

  const statusColors: Record<string, string> = {
    DRAFT: "#6b7280",
    ACTIVE: "#059669",
    PAUSED: "#d97706",
    ARCHIVED: "#dc2626",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Email Sequences</h1>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>
          {showForm ? "Cancel" : "+ New Sequence"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <label style={{ fontSize: 13, fontWeight: 500 }}>Sequence Name</label>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. New Client Outreach"
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}
            />
            <button onClick={handleCreate} style={btnStyle}>Create with 3 default steps</button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sequences.map((seq) => (
            <div
              key={seq.id}
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 20,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>{seq.name}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>
                  {(seq.steps as any[]).length} steps | {seq._count.enrollments} enrolled
                </p>
              </div>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background: `${statusColors[seq.status] || "#666"}20`,
                  color: statusColors[seq.status] || "#666",
                }}
              >
                {seq.status}
              </span>
            </div>
          ))}

          {sequences.length === 0 && (
            <p style={{ color: "#666", textAlign: "center", padding: 40 }}>
              No sequences yet. Create one to start automating outreach.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
