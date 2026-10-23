import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllFamilies } from "../services/familyService";
import { getLocalMembers } from "../services/localStore";
import { isFirebaseConfigured } from "../services/firebase";
import { 
  Users, 
  Home, 
  Plus, 
  Settings, 
  UserPlus, 
  ChevronRight, 
  ShieldCheck, 
  Database 
} from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState({ totalFamilies: 0, totalMembers: 0 });
  const [recentFamilies, setRecentFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const fams = await getAllFamilies();
        const totalF = fams.length;
        const totalM = fams.reduce((acc, f) => acc + (f.memberCount || 0), 0);
        setStats({ totalFamilies: totalF, totalMembers: totalM });
        setRecentFamilies(fams.slice(0, 5));
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <main className="page-container">
      <div className="admin-dashboard-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage family records, members, and directory permissions
          </p>
        </div>

        <div className="db-status-pill">
          <Database size={15} />
          <span>{isFirebaseConfigured ? "Connected to Cloud Firestore" : "Running in Local Demo Storage"}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box bg-blue">
            <Home size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-number">{stats.totalFamilies}</span>
            <span className="metric-label">Total Families (કુલ કુટુંબ)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-green">
            <Users size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-number">{stats.totalMembers}</span>
            <span className="metric-label">Total Members (કુલ સભ્યો)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-purple">
            <ShieldCheck size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-number">Admin</span>
            <span className="metric-label">Role: Full Control</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="dashboard-actions-panel">
        <h2 className="panel-title">Quick Actions</h2>
        <div className="actions-button-grid">
          <Link to="/admin/families/new" className="action-card primary-action">
            <Plus size={22} />
            <div className="action-card-text">
              <strong>Add New Kutumb (નવું કુટુંબ ઉમેરો)</strong>
              <span>Register a new family head and ancestral village</span>
            </div>
            <ChevronRight size={18} className="action-arrow" />
          </Link>

          <Link to="/admin/families" className="action-card">
            <Home size={22} />
            <div className="action-card-text">
              <strong>Manage All Families (કુટુંબ યાદી)</strong>
              <span>View, edit, or delete registered families</span>
            </div>
            <ChevronRight size={18} className="action-arrow" />
          </Link>

          <Link to="/admin/members" className="action-card">
            <Users size={22} />
            <div className="action-card-text">
              <strong>Manage Members (બધા સભ્યો)</strong>
              <span>Search, edit member profiles, and update photos</span>
            </div>
            <ChevronRight size={18} className="action-arrow" />
          </Link>
        </div>
      </div>

      {/* Recent Families Table */}
      <div className="recent-records-section">
        <div className="section-header-row">
          <h2 className="panel-title">Recently Added Families</h2>
          <Link to="/admin/families" className="btn-link">
            View All Families &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading records...</p>
          </div>
        ) : recentFamilies.length > 0 ? (
          <div className="table-responsive">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Family Head (કુટુંબના વડા)</th>
                  <th>Original Village (મૂળ ગામ)</th>
                  <th>Mataji Madh</th>
                  <th>Members</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentFamilies.map((fam) => (
                  <tr key={fam.id || fam.familyId}>
                    <td>
                      <strong>{fam.headFullName}</strong>
                    </td>
                    <td>{fam.originalVillage}</td>
                    <td>{fam.matajiMadhSthal}</td>
                    <td>
                      <span className="count-pill small">{fam.memberCount || 1}</span>
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/family/${fam.id || fam.familyId}`}
                        className="btn btn-secondary btn-xs"
                      >
                        Open
                      </Link>
                      <Link
                        to={`/admin/families/${fam.id || fam.familyId}/edit`}
                        className="btn btn-secondary btn-xs"
                        style={{ marginLeft: '6px' }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No family records yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
