import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Deal {
  id: string;
  title: string;
  value: number;
  probability: number;
  prospect: { id: string; name: string };
  owner: { id: string; name: string };
}

const STAGES = [
  { key: "PROSPECT", label: "Prospect", color: "#6b7280" },
  { key: "CONTACTED", label: "Contacted", color: "#2563eb" },
  { key: "MEETING_SCHEDULED", label: "Meeting", color: "#7c3aed" },
  { key: "PROPOSAL_SENT", label: "Proposal", color: "#d97706" },
  { key: "NEGOTIATION", label: "Negotiation", color: "#dc2626" },
  { key: "WON", label: "Won", color: "#059669" },
];

export function PipelinePage() {
  const [pipeline, setPipeline] = useState<Record<string, Deal[]>>({});
  const [forecast, setForecast] = useState<{ _sum: { value: number | null }; _avg: { probability: number | null } }>({
    _sum: { value: null },
    _avg: { probability: null },
  });

  useEffect(() => {
    api("/deals/pipeline").then((d) => {
      setPipeline(d.pipeline);
      setForecast(d.forecast);
    });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Pipeline</h1>
        <p style={{ color: "#666", margin: 0, fontSize: 14 }}>
          Forecast: ${(forecast._sum?.value || 0).toLocaleString()} | Avg probability:{" "}
          {Math.round((forecast._avg?.probability || 0) * 100)}%
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
        {STAGES.map((stage) => {
          const deals = pipeline[stage.key] || [];
          const total = deals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage.key}
              style={{
                minWidth: 240,
                flex: "0 0 240px",
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: `3px solid ${stage.color}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>{stage.label}</span>
                <span style={{ fontSize: 12, color: "#666" }}>
                  {deals.length} | ${total.toLocaleString()}
                </span>
              </div>

              <div style={{ padding: 8, minHeight: 200 }}>
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    style={{
                      background: "#f9fafb",
                      borderRadius: 6,
                      padding: 12,
                      marginBottom: 8,
                      border: "1px solid #eee",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{deal.title}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>
                      {deal.prospect.name}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 8,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>${deal.value.toLocaleString()}</span>
                      <span style={{ color: "#666" }}>{Math.round(deal.probability * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
