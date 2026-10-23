import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getFamilyById, deleteFamily } from "../services/familyService";
import { getMembersByFamilyId, createMember } from "../services/memberService";
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
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink
} from "lucide-react";

const COMMON_RELATIONSHIPS = [
  "પુત્ર (Son)",
  "પુત્રી (Daughter)",
  "પત્ની (Wife)",
  "પતિ (Husband)",
  "પિતા (Father)",
  "માતા (Mother)",
  "ભાઈ (Brother)",
  "બહેન (Sister)",
  "પુત્રવધૂ (Daughter-in-law)",
  "જમાઈ (Son-in-law)",
  "પૌત્ર (Grandson)",
  "પૌત્રી (Granddaughter)",
  "દોહિત્ર (Grandson - daughter's son)",
  "દોહિત્રી (Granddaughter - daughter's daughter)",
  "Other (અન્ય સંબંધ લખો)"
];

export function FamilyDetails({ isAdminView = false }) {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  // Show admin controls ONLY if currently in Admin View
  const showAdminControls = isAdminView && isAdmin;

  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Add Member Modal States
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [quickMemName, setQuickMemName] = useState("");
  const [quickMemRelation, setQuickMemRelation] = useState("પુત્ર (Son)");
  const [quickMemCustomRelation, setQuickMemCustomRelation] = useState("");
  const [quickMemDob, setQuickMemDob] = useState("");
  const [quickMemEducation, setQuickMemEducation] = useState("");
  const [quickMemOccupation, setQuickMemOccupation] = useState("");
  const [quickMemMobile, setQuickMemMobile] = useState("");
  const [quickMemSubmitting, setQuickMemSubmitting] = useState(false);
  const [quickMemError, setQuickMemError] = useState("");
  const [quickMemSuccess, setQuickMemSuccess] = useState("");

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

  // Quick Add Member Handler
  const handleQuickAddMember = async (e, addAnother = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!quickMemName.trim()) {
      setQuickMemError("Please enter member full name (સભ્યનું પૂરું નામ લખો).");
      return;
    }

    setQuickMemSubmitting(true);
    setQuickMemError("");
    setQuickMemSuccess("");

    const relation = quickMemRelation === "Other (અન્ય સંબંધ લખો)"
      ? (quickMemCustomRelation.trim() || "અન્ય")
      : quickMemRelation;

    const payload = {
      fullName: quickMemName.trim(),
      relationshipToHead: relation,
      dateOfBirth: quickMemDob,
      education: quickMemEducation.trim(),
      occupation: quickMemOccupation.trim(),
      mobileNumber: quickMemMobile.trim(),
      workplaceAddress: "",
      maternalSurname: family?.maternalSurname || "",
      maternalVillage: family?.originalVillage || "",
      residentialAddress: family?.residentialAddress || "",
      photoUrl: "",
      isPublicMobile: true,
      isPublicAddress: true
    };

    try {
      const targetFamId = family.id || family.familyId || familyId;
      const created = await createMember(targetFamId, payload);
      
      // Update UI immediately
      setMembers(prev => [...prev, created]);
      setFamily(prev => ({
        ...prev,
        memberCount: (prev.memberCount || 0) + 1
      }));

      // Reset fields
      setQuickMemName("");
      setQuickMemRelation("પુત્ર (Son)");
      setQuickMemCustomRelation("");
      setQuickMemDob("");
      setQuickMemEducation("");
      setQuickMemOccupation("");
      setQuickMemMobile("");

      if (addAnother) {
        setQuickMemSuccess(`"${created.fullName}" successfully added! You can add another below.`);
      } else {
        setIsAddMemberModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to add member:", err);
      setQuickMemError(err.message || "Failed to add member.");
    } finally {
      setQuickMemSubmitting(false);
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

  return (
    <main className="page-container">
      {/* Top Navigation */}
      <div className="page-top-nav">
        <Link to={showAdminControls ? "/admin/families" : "/"} className="back-link">
          <ArrowLeft size={18} />
          <span>{showAdminControls ? "Back to Manage Families" : "Back to All Families"}</span>
        </Link>

        {showAdminControls && (
          <div className="admin-actions-bar">
            <button
              onClick={() => {
                setQuickMemError("");
                setQuickMemSuccess("");
                setIsAddMemberModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              <span>Add Member (સભ્ય ઉમેરો)</span>
            </button>
            <Link to={`/admin/families/${familyId}/edit`} className="btn btn-secondary btn-sm">
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
            <p>Including the family head and all associated members</p>
          </div>
          {showAdminControls && (
            <button
              onClick={() => {
                setQuickMemError("");
                setQuickMemSuccess("");
                setIsAddMemberModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              <span>Add Member (સભ્ય ઉમેરો)</span>
            </button>
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

      {/* QUICK ADD MEMBER MODAL */}
      {isAddMemberModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Users size={20} className="meta-icon" />
                <h3>Add Member to {family.headFullName}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddMemberModalOpen(false)}
                disabled={quickMemSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => handleQuickAddMember(e, false)}>
              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                {quickMemError && (
                  <div className="alert-box error" style={{ padding: '0.6rem', marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    <span>{quickMemError}</span>
                  </div>
                )}

                {quickMemSuccess && (
                  <div className="alert-box success" style={{ padding: '0.6rem', marginBottom: '1rem' }}>
                    <CheckCircle2 size={16} />
                    <span>{quickMemSuccess}</span>
                  </div>
                )}

                <div className="form-field-group">
                  <label className="form-label">
                    <span>Member Full Name (સભ્યનું પૂરું નામ)</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={quickMemName}
                    onChange={(e) => setQuickMemName(e.target.value)}
                    placeholder="e.g. અક્ષય પટેલ (Akshay Patel)"
                    autoFocus
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-field-group">
                    <label className="form-label">Relationship (સંબંધ)</label>
                    <select
                      className="form-control"
                      value={quickMemRelation}
                      onChange={(e) => setQuickMemRelation(e.target.value)}
                    >
                      {COMMON_RELATIONSHIPS.map((rel) => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>

                  {quickMemRelation === "Other (અન્ય સંબંધ લખો)" && (
                    <div className="form-field-group">
                      <label className="form-label">Specify (વિગતવાર લખો)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={quickMemCustomRelation}
                        onChange={(e) => setQuickMemCustomRelation(e.target.value)}
                        placeholder="e.g. ભાણેજ / સાળો"
                      />
                    </div>
                  )}

                  <div className="form-field-group">
                    <label className="form-label">Date of Birth (જન્મ તારીખ)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={quickMemDob}
                      onChange={(e) => setQuickMemDob(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field-group">
                    <label className="form-label">Education (અભ્યાસ)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={quickMemEducation}
                      onChange={(e) => setQuickMemEducation(e.target.value)}
                      placeholder="e.g. B.Tech / M.Sc. / Standard 10"
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-label">Occupation (વ્યવસાય / નોકરી)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={quickMemOccupation}
                      onChange={(e) => setQuickMemOccupation(e.target.value)}
                      placeholder="e.g. Software Engineer / વેપાર"
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Mobile Number (મોબાઈલ નંબર)</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={quickMemMobile}
                    onChange={(e) => setQuickMemMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                  <Link
                    to={`/admin/families/${familyId}/members/new`}
                    style={{ fontSize: '0.8rem', color: 'var(--accent-color)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Open full photo & address form</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  disabled={quickMemSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => handleQuickAddMember(e, true)}
                  disabled={quickMemSubmitting}
                >
                  <Plus size={15} />
                  <span>Save & Add Another</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={quickMemSubmitting}
                >
                  {quickMemSubmitting ? "Saving..." : "Save Member (સભ્ય સાચવો)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
