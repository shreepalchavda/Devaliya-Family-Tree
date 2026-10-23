import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Shield, 
  LayoutDashboard, 
  Home, 
  Users, 
  Plus, 
  ExternalLink, 
  LogOut 
} from "lucide-react";

export function AdminHeader() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isActive = (path) => {
    if (path === "/admin" && location.pathname === "/admin") return true;
    if (path !== "/admin" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="admin-portal-header">
      <div className="admin-header-container">
        <div className="admin-brand-section">
          <Link to="/admin" className="admin-brand-link">
            <div className="admin-icon-box">
              <Shield size={20} />
            </div>
            <div className="admin-brand-text">
              <span className="admin-portal-name">Admin Portal</span>
              <span className="admin-portal-sub">Directory Management</span>
            </div>
          </Link>
        </div>

        <nav className="admin-nav-links">
          <Link 
            to="/admin" 
            className={`admin-nav-item ${isActive("/admin") && location.pathname === "/admin" ? "active" : ""}`}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/admin/families" 
            className={`admin-nav-item ${isActive("/admin/families") && !location.pathname.includes("/new") ? "active" : ""}`}
          >
            <Home size={16} />
            <span>Families</span>
          </Link>

          <Link 
            to="/admin/members" 
            className={`admin-nav-item ${isActive("/admin/members") ? "active" : ""}`}
          >
            <Users size={16} />
            <span>Members</span>
          </Link>

          <Link to="/admin/families/new" className="btn btn-primary btn-sm admin-cta-btn">
            <Plus size={15} />
            <span>Add Kutumb</span>
          </Link>
        </nav>

        <div className="admin-utility-links">
          <Link to="/" target="_blank" rel="noreferrer" className="btn btn-secondary btn-xs visit-public-btn" title="View Public Website">
            <span>Public Site</span>
            <ExternalLink size={12} />
          </Link>

          <button onClick={handleLogout} className="btn btn-secondary btn-xs logout-btn" title="Log out">
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
