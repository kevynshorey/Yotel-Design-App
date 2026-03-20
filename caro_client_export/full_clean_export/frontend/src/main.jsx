import React, { useEffect, useState, Component } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Error boundary — prevents white screen on crash
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: "system-ui", color: "#333" }}>
          <h2 style={{ color: "#E74C3C", marginBottom: 12 }}>Something went wrong</h2>
          <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 8, fontSize: 12, overflow: "auto", maxHeight: 200 }}>
            {this.state.error.message}
          </pre>
          <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ marginTop: 16, padding: "8px 20px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer", background: "#fff" }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Set your client password here. Change before deploying.
const PASS = "barbados2026";

// To disable the gate entirely, set GATE_ENABLED = false
const GATE_ENABLED = true;

const getLocalDateKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const isAuthedNow = () => {
  if (!GATE_ENABLED) return true;
  if (sessionStorage.getItem("yotel_auth") === "1") return true;
  return (
    localStorage.getItem("yotel_auth") === "1" &&
    localStorage.getItem("yotel_auth_date") === getLocalDateKey()
  );
};

function EyeIcon({ size = 18, color = "#6B7A8D" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.2 12s3.6-7 9.8-7 9.8 7 9.8 7-3.6 7-9.8 7S2.2 12 2.2 12Z" stroke={color} strokeWidth="1.8" />
      <path d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Z" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon({ size = 18, color = "#6B7A8D" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18" stroke={color} strokeWidth="1.8" />
      <path d="M10.6 6.1A10.6 10.6 0 0 1 12 6c6.2 0 9.8 6 9.8 6a18.8 18.8 0 0 1-3.2 3.9" stroke={color} strokeWidth="1.8" />
      <path d="M6.3 7.7C3.4 10.4 2.2 12 2.2 12s3.6 7 9.8 7c1.3 0 2.5-.2 3.5-.6" stroke={color} strokeWidth="1.8" />
      <path d="M10.2 10.2a3.2 3.2 0 0 0 4.4 4.4" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function Gate() {
  const [authed, setAuthed] = useState(
    isAuthedNow
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  if (authed) return <App />;

  useEffect(() => {
    const t = setInterval(() => {
      const next = isAuthedNow();
      setAuthed(next);
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  const submit = () => {
    if (input === PASS) {
      if (keepLoggedIn) {
        localStorage.setItem("yotel_auth", "1");
        localStorage.setItem("yotel_auth_date", getLocalDateKey());
        sessionStorage.removeItem("yotel_auth");
      } else {
        sessionStorage.setItem("yotel_auth", "1");
        localStorage.removeItem("yotel_auth");
        localStorage.removeItem("yotel_auth_date");
      }
      setAuthed(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      background: "#F0F2F5",
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: "40px 36px", textAlign: "center",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)", maxWidth: 360, width: "100%",
      }}>
        <div style={{ fontSize: 10, color: "#F39C12", textTransform: "uppercase", letterSpacing: 2.5, fontWeight: 600, marginBottom: 4 }}>
          Coruscant Developments
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#1A2233", marginBottom: 4 }}>
          YOTEL+YOTELPAD Barbados
        </div>
        <div style={{ fontSize: 12, color: "#6B7A8D", marginBottom: 24 }}>
          Masterplan Explorer
        </div>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter access code"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            style={{
              width: "100%",
              padding: "10px 38px 10px 14px",
              borderRadius: 8,
              fontSize: 14,
              border: `1.5px solid ${error ? "#E74C3C" : "#E2E6EB"}`,
              outline: "none",
              textAlign: "center",
              transition: "border-color .2s",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 4,
            }}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 12, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={e => setKeepLoggedIn(e.target.checked)}
            style={{ width: 14, height: 14 }}
          />
          <span style={{ fontSize: 12, color: "#6B7A8D" }}>Stay logged in for today</span>
        </label>
        <button onClick={submit} style={{
          width: "100%", padding: "10px 0", borderRadius: 8, border: "none",
          background: "#7B2D8E", color: "#fff", fontSize: 13, fontWeight: 600,
          cursor: "pointer",
        }}>
          Enter
        </button>
        {error && <div style={{ color: "#E74C3C", fontSize: 12, marginTop: 8 }}>Incorrect code</div>}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Gate />
    </ErrorBoundary>
  </React.StrictMode>
);
