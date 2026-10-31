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
  ArrowLeft,
  Sparkles,
  FileDown 
} from "lucide-react";
import { downloadFamilyPdf, downloadAllFamiliesMasterPdf } from "../utils/exportFamilyPdf";

export function ManageFamilies() {
  const [families, setFamilies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [familyToDelete, setFamilyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingFamId, setDownloadingFamId] = useState(null);
  const [isExportingMaster, setIsExportingMaster] = useState(false);
  const [masterExportProgress, setMasterExportProgress] = useState("");

  const handleExportMasterPdf = async () => {
    if (isExportingMaster) return;
    setIsExportingMaster(true);
    setMasterExportProgress("Starting Master PDF export...");
    try {
      await downloadAllFamiliesMasterPdf(families, ({ current, total, status }) => {
        setMasterExportProgress(status);
      });
    } catch (err) {
      console.error("Master PDF Export Error:", err);
      alert("Failed to export Master Directory PDF: " + (err.message || "Unknown error"));
    } finally {
      setIsExportingMaster(false);
      setMasterExportProgress("");
    }
  };

  const handleDownloadPdf = async (fam) => {
    const famId = fam.id || fam.familyId;
    setDownloadingFamId(famId);
    try {
      await downloadFamilyPdf(fam);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF: " + (err.message || "Unknown error"));
    } finally {
      setDownloadingFamId(null);
    }
  };

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

    const handleFocus = () => loadData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
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

        <div className="admin-nav-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportMasterPdf}
            disabled={isExportingMaster}
            title="Download single Master PDF containing all registered families"
          >
            <FileDown size={15} />
            <span>{isExportingMaster ? masterExportProgress || "Exporting..." : "Export All to PDF (સંપૂર્ણ PDF)"}</span>
          </button>

          <Link to="/admin/families/new" className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Kutumb (કુટુંબ ઉમેરો)</span>
          </Link>
        </div>
      </div>

      <div className="manage-header-row">
        <div>
          <h1 className="page-title">Manage Families (કુટુંબ વ્યવસ્થાપન)</h1>
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
        <>
          {/* Desktop Table View */}
          <div className="table-responsive desktop-table-view">
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
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(fam)}
                            disabled={downloadingFamId === famId}
                            className="btn btn-secondary btn-xs"
                            title="Download Family PDF (કોષ્ટક સાથે PDF ડાઉનલોડ)"
                          >
                            <FileDown size={13} />
                            <span>{downloadingFamId === famId ? "PDF..." : "PDF"}</span>
                          </button>
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

          {/* Mobile Cards View (Clean, Spacious, Easy to Read) */}
          <div className="mobile-family-cards-list">
            {filteredFamilies.map((fam) => {
              const famId = fam.id || fam.familyId;
              return (
                <div key={famId} className="mobile-admin-family-card">
                  <div className="mobile-fam-top">
                    <Link to={`/family/${famId}`} className="mobile-fam-name">
                      {fam.headFullName}
                    </Link>
                    <span className="count-pill small">
                      <Users size={12} /> {fam.memberCount || 1}
                    </span>
                  </div>

                  <div className="mobile-fam-meta">
                    {fam.originalVillage && (
                      <span className="mobile-meta-tag">
                        <MapPin size={13} /> {fam.originalVillage}
                      </span>
                    )}
                    {fam.matajiMadhSthal && (
                      <span className="mobile-meta-tag">
                        <Sparkles size={13} /> {fam.matajiMadhSthal}
                      </span>
                    )}
                  </div>

                  <div className="mobile-fam-actions">
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(fam)}
                      disabled={downloadingFamId === famId}
                      className="btn btn-secondary btn-xs"
                      title="Download Family PDF"
                    >
                      <FileDown size={13} /> {downloadingFamId === famId ? "PDF..." : "PDF"}
                    </button>
                    <Link
                      to={`/family/${famId}`}
                      className="btn btn-secondary btn-xs"
                    >
                      <ExternalLink size={13} /> View
                    </Link>
                    <Link
                      to={`/admin/families/${famId}/members/new`}
                      className="btn btn-secondary btn-xs"
                    >
                      <Plus size={13} /> + Member
                    </Link>
                    <Link
                      to={`/admin/families/${famId}/edit`}
                      className="btn btn-secondary btn-xs"
                    >
                      <Edit3 size={13} /> Edit
                    </Link>
                    <button
                      onClick={() => setFamilyToDelete(fam)}
                      className="btn btn-danger-outline btn-xs"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
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
