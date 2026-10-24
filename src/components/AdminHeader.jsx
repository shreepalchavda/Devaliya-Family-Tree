import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, LogOut } from "lucide-react";

export function AdminHeader() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="site-header admin-site-header">
      <div className="header-container">
        <Link to="/" className="brand-logo">
          <div className="logo-icon-box" style={{ backgroundColor: '#2563eb' }}>
            <Shield className="logo-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Admin Management Portal</span>
          </div>
        </Link>

        {currentUser && (
          <nav className="header-nav">
            <button onClick={handleLogout} className="btn btn-danger-outline btn-sm" title="Log out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
