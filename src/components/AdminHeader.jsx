import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Home, Users, Plus, LogOut, ExternalLink } from "lucide-react";

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
            <span className="brand-sub">કુટુંબ ડિરેક્ટરી એડમિન પેનલ</span>
          </div>
        </Link>

        {currentUser && (
          <nav className="header-nav">
            <Link to="/" className="nav-link">
              <Home size={18} />
              <span>Dashboard</span>
            </Link>

            <Link to="/families" className="nav-link">
              <Users size={18} />
              <span>Families</span>
            </Link>

            <Link to="/members" className="nav-link">
              <Users size={18} />
              <span>Members</span>
            </Link>

            <Link to="/families/new" className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>+ Add Kutumb</span>
            </Link>

            <a 
              href="http://localhost:5173" 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-secondary btn-sm"
              title="Preview Public Website"
            >
              <span>Live Site</span>
              <ExternalLink size={14} />
            </a>

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
