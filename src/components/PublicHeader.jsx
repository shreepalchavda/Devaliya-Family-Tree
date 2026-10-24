import React from "react";
import { Link } from "react-router-dom";
import { Users, Home } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="brand-logo">
          <div className="logo-icon-box">
            <Users className="logo-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Family Directory</span>
          </div>
        </Link>

        <nav className="header-nav">
          <Link to="/" className="nav-link">
            <Home size={18} />
            <span>Home</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
