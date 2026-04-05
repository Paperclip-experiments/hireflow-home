import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Prospect {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  score: number;
  status: string;
  contactName: string | null;
  contactEmail: string | null;
  _count: { signals: number; deals: number };
}

export function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", industry: "", location: "", contactName: "", contactEmail: "" });

  const load = () => {
    setLoading(true);
    api("/prospects?sortBy=score&order=desc")
      .then((d) => {
        setProspects(d.prospects);
        setTotal(d.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await api("/prospects", { method: "POST", body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ name: "", industry: "", location: "", contactName: "", contactEmail: "" });
    load();
  };

  const statusColors: Record<string, string> = {
    NEW: "#6b7280",
    CONTACTED: "#2563eb",
    QUALIFIED: "#7c3aed",
    ENGAGED: "#d97706",
    CONVERTED: "#059669",
    LOST: "#dc2626",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Prospects</h1>
          <p style={{ color: "#666", margin: "4px 0 0", fontSize: 14 }}>{total} companies tracked</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>
          {showForm ? "Cancel" : "+ Add Prospect"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input placeholder="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} style={inputStyle} />
            <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={inputStyle} />
            <input placeholder="Contact Name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} style={inputStyle} />
            <input placeholder="Contact Email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} style={inputStyle} />
            <button onClick={handleCreate} style={btnStyle}>Save</button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Industry</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Signals</th>
                <th style={thStyle}>Contact</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={tdStyle}><strong>{p.name}</strong></td>
                  <td style={tdStyle}>{p.industry || "-"}</td>
                  <td style={tdStyle}>{p.location || "-"}</td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600, color: p.score >= 60 ? "#059669" : p.score >= 30 ? "#d97706" : "#6b7280" }}>
                      {p.score}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 12, background: `${statusColors[p.status] || "#666"}20`, color: statusColors[p.status] || "#666" }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{p._count.signals}</td>
                  <td style={tdStyle}>{p.contactName || p.contactEmail || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #ddd",
  borderRadius: 6,
  fontSize: 14,
};

const thStyle: React.CSSProperties = { padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "#666", textTransform: "uppercase" };
const tdStyle: React.CSSProperties = { padding: "10px 12px" };
