import React from "react";
import { Link } from "react-router-dom";
import { Users, Lock } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="site-header public-header">
      <div className="header-container">
        <Link to="/" className="brand-logo">
          <div className="logo-icon-box">
            <Users className="logo-icon" size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Family Directory</span>
            <span className="brand-sub">કુટુંબ ડિરેક્ટરી</span>
          </div>
        </Link>

        <nav className="header-nav">
          <Link to="/" className="nav-link">
            <span>Home</span>
          </Link>
          <Link to="/admin" className="nav-link admin-portal-btn" title="Admin Portal">
            <Lock size={14} />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
