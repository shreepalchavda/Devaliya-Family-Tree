import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users, Shield, LogOut, Plus, Home } from "lucide-react";

export function Header() {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="brand-logo">
          <div className="logo-icon-box">
            <Users className="logo-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Family Directory</span>
            <span className="brand-sub">કુટુંબ ડિરેક્ટરી</span>
          </div>
        </Link>

        <nav className="header-nav">
          <Link to="/" className="nav-link">
            <Home size={18} />
            <span>Home</span>
          </Link>

          {isAdmin ? (
            <>
              <Link to="/admin" className="nav-link admin-pill">
                <Shield size={16} />
                <span>Admin Panel</span>
              </Link>
              <Link to="/admin/families/new" className="btn btn-primary btn-sm">
                <Plus size={16} />
                <span>Add Kutumb</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="nav-link admin-login-link">
              <Shield size={16} />
              <span>Admin Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
