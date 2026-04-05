import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/prospects", label: "Prospects" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/sequences", label: "Sequences" },
  { to: "/signals", label: "Signals" },
];

export function Layout() {
  const { user, agency, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: 220,
          background: "#1a1a2e",
          color: "#fff",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "0 20px", marginBottom: 30 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>HireFlow</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.7 }}>{agency?.name}</p>
        </div>

        <div style={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "block",
                padding: "10px 20px",
                color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                borderLeft: isActive ? "3px solid #4f46e5" : "3px solid transparent",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>{user?.name}</p>
          <button
            onClick={handleLogout}
            style={{
              marginTop: 8,
              background: "none",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, background: "#f5f5f7", padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
