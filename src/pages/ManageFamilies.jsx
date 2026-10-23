import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllFamilies, deleteFamily } from "../services/familyService";
import { ConfirmModal } from "../components/ConfirmModal";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  ExternalLink, 
  Home, 
  MapPin, 
  ArrowLeft 
} from "lucide-react";

export function ManageFamilies() {
  const [families, setFamilies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [familyToDelete, setFamilyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllFamilies();
      setFamilies(data);
    } catch (err) {
      console.error("Error fetching families:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async () => {
    if (!familyToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFamily(familyToDelete.id || familyToDelete.familyId);
      setFamilyToDelete(null);
      await loadData();
    } catch (err) {
      console.error("Failed to delete family:", err);
      alert("Failed to delete family: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFamilies = families.filter((f) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (f.headFullName && f.headFullName.toLowerCase().includes(q)) ||
      (f.originalVillage && f.originalVillage.toLowerCase().includes(q)) ||
      (f.matajiMadhSthal && f.matajiMadhSthal.toLowerCase().includes(q))
    );
  });

  return (
    <main className="page-container">
      <div className="page-top-nav">
        <Link to="/admin" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </Link>

        <Link to="/admin/families/new" className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>Add Kutumb (કુટુંબ ઉમેરો)</span>
        </Link>
      </div>

      <div className="manage-header-row">
        <div>
          <h1 className="page-title">Manage Families (કુટુંબ વ્યવસ્થાપન)</h1>
          <p className="page-subtitle">
            View, edit, and organize family units and their members
          </p>
        </div>

        <div className="table-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="table-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by head name, village..."
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading families...</p>
        </div>
      ) : filteredFamilies.length > 0 ? (
        <div className="table-responsive">
          <table className="standard-table">
            <thead>
              <tr>
                <th>Family Head (કુટુંબના વડા)</th>
                <th>Original Village (મૂળ ગામ)</th>
                <th>Mataji Madh Sthal</th>
                <th>Members</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFamilies.map((fam) => {
                const famId = fam.id || fam.familyId;
                return (
                  <tr key={famId}>
                    <td>
                      <div className="table-main-title">
                        <Link to={`/family/${famId}`} className="hover-link">
                          {fam.headFullName}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <span className="village-badge">
                        <MapPin size={13} /> {fam.originalVillage}
                      </span>
                    </td>
                    <td>{fam.matajiMadhSthal}</td>
                    <td>
                      <span className="count-pill small">
                        <Users size={12} /> {fam.memberCount || 1}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <Link
                          to={`/family/${famId}`}
                          className="btn btn-secondary btn-xs"
                          title="Open Family View"
                        >
                          <ExternalLink size={13} />
                          <span>View</span>
                        </Link>
                        <Link
                          to={`/admin/families/${famId}/members/new`}
                          className="btn btn-secondary btn-xs"
                          title="Add Member"
                        >
                          <Plus size={13} />
                          <span>+ Member</span>
                        </Link>
                        <Link
                          to={`/admin/families/${famId}/edit`}
                          className="btn btn-secondary btn-xs"
                          title="Edit Family"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => setFamilyToDelete(fam)}
                          className="btn btn-danger-outline btn-xs"
                          title="Delete Family"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <Home size={36} className="empty-icon" />
          <h3>No matching families found</h3>
          <p>Try refining your search filter or add a new family.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(familyToDelete)}
        title="Delete Family Record"
        message={`Are you sure you want to delete "${familyToDelete?.headFullName}" and all associated member records? This will permanently remove the entire family from the directory.`}
        confirmText="Yes, Delete Family"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setFamilyToDelete(null)}
        isLoading={isDeleting}
      />
    </main>
  );
}
