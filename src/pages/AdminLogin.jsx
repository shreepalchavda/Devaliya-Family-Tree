import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, Mail, AlertCircle, ArrowLeft, Info } from "lucide-react";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("admin@family.org");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-box">
            <Shield size={32} />
          </div>
          <h2>Admin Login</h2>
          <p>Authorized administrators access only</p>
        </div>

        {error && (
          <div className="alert-box error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@family.org"
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Authenticating..." : "Sign In to Admin Panel"}
          </button>
        </form>

        {!isFirebaseConfigured && (
          <div className="demo-credentials-banner">
            <div className="demo-info-title">
              <Info size={16} />
              <span>Demo Mode Active</span>
            </div>
            <p>
              Firebase environment variables are not yet set. You can log in using demo credentials:
            </p>
            <div className="demo-credentials-code">
              <div><strong>Email:</strong> admin@family.org</div>
              <div><strong>Password:</strong> admin123</div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-block"
              onClick={handleDemoFill}
            >
              Fill Demo Credentials
            </button>
          </div>
        )}

        <div className="login-footer">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Public Directory</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
