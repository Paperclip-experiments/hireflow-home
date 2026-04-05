import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

interface Stats {
  prospects: number;
  deals: number;
  signals: number;
  pipelineValue: number;
}

export function DashboardPage() {
  const { user, agency } = useAuth();
  const [stats, setStats] = useState<Stats>({ prospects: 0, deals: 0, signals: 0, pipelineValue: 0 });

  useEffect(() => {
    Promise.all([
      api("/prospects?limit=1").then((d) => d.total || 0),
      api("/deals").then((d) => d.deals?.length || 0),
      api("/signals/stats").then((d) => d.totalSignals || 0),
      api("/deals/pipeline").then((d) => d.forecast?._sum?.value || 0),
    ]).then(([prospects, deals, signals, pipelineValue]) => {
      setStats({ prospects, deals, signals, pipelineValue });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Prospects", value: stats.prospects, color: "#4f46e5" },
    { label: "Active Deals", value: stats.deals, color: "#059669" },
    { label: "Signals Detected", value: stats.signals, color: "#d97706" },
    { label: "Pipeline Value", value: `$${stats.pipelineValue.toLocaleString()}`, color: "#dc2626" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Dashboard</h1>
      <p style={{ color: "#666", margin: "0 0 24px", fontSize: 14 }}>
        Welcome back, {user?.name}. Here's your {agency?.name} overview.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 20,
              borderLeft: `4px solid ${card.color}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{card.label}</p>
            <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#1a1a2e" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
