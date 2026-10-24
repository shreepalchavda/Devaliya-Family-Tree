import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getFamilyById, deleteFamily } from "../services/familyService";
import { getMembersByFamilyId } from "../services/memberService";
import { MemberCard } from "../components/MemberCard";
import { ConfirmModal } from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, 
  MapPin, 
  Sparkles, 
  Users, 
  UserCheck, 
  Plus, 
  Edit3, 
  Trash2,
  AlertCircle 
} from "lucide-react";

export function FamilyDetails() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadFamilyData = async () => {
    setLoading(true);
    setError("");
    try {
      const fam = await getFamilyById(familyId);
      if (!fam) {
        setError("Family not found");
        setLoading(false);
        return;
      }
      setFamily(fam);

      const mems = await getMembersByFamilyId(familyId);
      setMembers(mems);
    } catch (err) {
      console.error("Error loading family details:", err);
      setError("Failed to load family information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (familyId) {
      loadFamilyData();
    }
  }, [familyId]);

  const handleDeleteFamily = async () => {
    setIsDeleting(true);
    try {
      await deleteFamily(familyId);
      setIsDeleteModalOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete family:", err);
      alert("Error deleting family: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading family details...</p>
        </div>
      </div>
    );
  }

  if (error || !family) {
    return (
      <div className="page-container">
        <div className="error-state">
          <AlertCircle size={40} className="error-icon" />
          <h2>{error || "Family Not Found"}</h2>
          <p>The requested family record does not exist or has been removed.</p>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Return to Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const targetFamilyId = family.id || family.familyId || familyId;

  return (
    <main className="page-container">
      {/* Top Navigation */}
      <div className="page-top-nav">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to All Families</span>
        </Link>

        {isAdmin && (
          <div className="admin-actions-bar">
            <Link 
              to={`/admin/families/${targetFamilyId}/members/new`} 
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              <span>Add Member (સભ્ય ઉમેરો)</span>
            </Link>
            <Link 
              to={`/admin/families/${targetFamilyId}/edit`} 
              className="btn btn-secondary btn-sm"
            >
              <Edit3 size={16} />
              <span>Edit Family</span>
            </Link>
            <button 
              onClick={() => setIsDeleteModalOpen(true)} 
              className="btn btn-danger-outline btn-sm"
              title="Delete Family"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Family Head Information Banner */}
      <section className="family-head-hero">
        <div className="family-head-top">
          <div className="head-badge-row">
            <span className="badge-pill head-pill">
              <UserCheck size={14} />
              Kutumb na Vda (કુટુંબના વડા)
            </span>
            <span className="badge-pill count-pill">
              <Users size={14} />
              {members.length} {members.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>
          <h1 className="family-head-title">{family.headFullName}</h1>
        </div>

        <div className="family-head-attributes">
          <div className="head-attribute-card">
            <MapPin size={18} className="attr-icon" />
            <div className="attr-text">
              <span className="attr-label">Original Village (મૂળ ગામ)</span>
              <strong className="attr-value">{family.originalVillage || "Not specified"}</strong>
            </div>
          </div>

          <div className="head-attribute-card">
            <Sparkles size={18} className="attr-icon" />
            <div className="attr-text">
              <span className="attr-label">Hak nu Mataji nu Madh Sthal (હકનું માતાજીનું મઢ સ્થળ)</span>
              <strong className="attr-value">{family.matajiMadhSthal || "Not specified"}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Family Member List */}
      <section className="family-members-section">
        <div className="members-section-header">
          <div className="header-titles">
            <h2>Family Members (કુટુંબના સભ્યોની યાદી)</h2>
          </div>
          {isAdmin && (
            <Link 
              to={`/admin/families/${targetFamilyId}/members/new`} 
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              <span>Add Member (સભ્ય ઉમેરો)</span>
            </Link>
          )}
        </div>

        {members.length > 0 ? (
          <div className="members-list-grid">
            {members.map((member) => (
              <MemberCard key={member.id || member.memberId} member={member} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Users size={32} className="empty-icon" />
            <p>No members recorded for this family yet.</p>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Kutumb / Family"
        message={`Are you sure you want to permanently delete the family of "${family.headFullName}"? This will also delete all ${members.length} associated member record(s) and cannot be undone.`}
        confirmText="Yes, Delete Family"
        cancelText="Cancel"
        onConfirm={handleDeleteFamily}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={isDeleting}
      />
    </main>
  );
}
