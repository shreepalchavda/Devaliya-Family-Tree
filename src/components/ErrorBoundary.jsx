import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          backgroundColor: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            maxWidth: "480px",
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
            textAlign: "center"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem"
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#1e293b",
              margin: "0 0 0.5rem"
            }}>
              કંઈક સમસ્યા આવી છે (Something went wrong)
            </h2>

            <p style={{
              fontSize: "0.95rem",
              color: "#64748b",
              lineHeight: 1.5,
              margin: "0 0 1.5rem"
            }}>
              એપ્લિકેશનમાં અણધારી ભૂલ આવી છે. કૃપા કરીને પેજ રીલોડ કરો અથવા હોમ પેજ પર પાછા જાઓ.
            </p>

            <div style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 1.25rem",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
              >
                <RefreshCw size={16} />
                <span>પેજ રીલોડ કરો</span>
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 1.25rem",
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
              >
                <Home size={16} />
                <span>હોમ પેજ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
