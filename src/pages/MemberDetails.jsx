import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMemberById, deleteMember } from "../services/memberService";
import { getFamilyById } from "../services/familyService";
import { calculateAge } from "../utils/calculateAge";
import { formatDate } from "../utils/formatDate";
import { ConfirmModal } from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, 
  User, 
  Crown, 
  Calendar, 
  Clock, 
  GraduationCap, 
  Briefcase, 
  Building, 
  Phone, 
  PhoneOff, 
  MapPin, 
  Home, 
  Edit3, 
  Trash2,
  AlertCircle 
} from "lucide-react";

export function MemberDetails({ isAdminView = false }) {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const showAdminControls = isAdminView && isAdmin;

  const [member, setMember] = useState(null);
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const mem = await getMemberById(memberId);
        if (!mem) {
          setError("Member not found");
          setLoading(false);
          return;
        }
        setMember(mem);

        if (mem.familyId) {
          const fam = await getFamilyById(mem.familyId);
          setFamily(fam);
        }
      } catch (err) {
        console.error("Error loading member details:", err);
        setError("Failed to load member profile");
      } finally {
        setLoading(false);
      }
    }

    if (memberId) {
      loadData();
    }
  }, [memberId]);

  const handleDeleteMember = async () => {
    setIsDeleting(true);
    try {
      await deleteMember(memberId, member.familyId);
      setIsDeleteModalOpen(false);
      if (member.familyId) {
        navigate(`/family/${member.familyId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to delete member:", err);
      alert("Error deleting member: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading member profile...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="page-container">
        <div className="error-state">
          <AlertCircle size={40} className="error-icon" />
          <h2>{error || "Member Profile Not Found"}</h2>
          <p>The requested member profile does not exist or has been removed.</p>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Return to Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const age = calculateAge(member.dateOfBirth);
  const formattedDob = formatDate(member.dateOfBirth);
  const isHead = (member.relationshipToHead || '').toLowerCase().includes('head') || (member.relationshipToHead || '').includes('વડા');

  // Privacy controls
  const canShowMobile = isAdmin || (member.isPublicMobile !== false && member.mobileNumber);
  const canShowAddress = isAdmin || (member.isPublicAddress !== false && member.residentialAddress);

  return (
    <main className="page-container">
      {/* Back Navigation & Admin Actions */}
      <div className="page-top-nav">
        {member.familyId ? (
          <Link to={`/family/${member.familyId}`} className="back-link">
            <ArrowLeft size={18} />
            <span>Back to Family: {family ? family.headFullName : "Kutumb Details"}</span>
          </Link>
        ) : (
          <Link to="/" className="back-link">
            <ArrowLeft size={18} />
            <span>Back to Directory</span>
          </Link>
        )}

        {showAdminControls && (
          <div className="admin-actions-bar">
            <Link to={`/admin/members/${memberId}/edit`} className="btn btn-secondary btn-sm">
              <Edit3 size={16} />
              <span>Edit Member</span>
            </Link>
            <button 
              onClick={() => setIsDeleteModalOpen(true)} 
              className="btn btn-danger-outline btn-sm"
              title="Delete Member"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Member Profile Card */}
      <div className="member-profile-card">
        {/* Profile Header Header */}
        <div className="profile-hero-header">
          <div className="profile-photo-container">
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.fullName} className="profile-img" />
            ) : (
              <div className="profile-img-fallback">
                {isHead ? <Crown size={48} className="crown-icon" /> : <User size={48} />}
              </div>
            )}
          </div>

          <div className="profile-title-block">
            <div className="profile-badge-row">
              <span className={`relation-tag ${isHead ? 'head-tag' : ''}`}>
                {member.relationshipToHead || "Family Member"}
              </span>
              {family && (
                <Link to={`/family/${member.familyId}`} className="family-reference-tag">
                  Kutumb: {family.headFullName}
                </Link>
              )}
            </div>

            <h1 className="profile-full-name">{member.fullName}</h1>

            {/* Quick summary line if occupation or village is available */}
            {(member.occupation || family?.originalVillage) && (
              <p className="profile-sub-summary">
                {member.occupation} {family?.originalVillage ? `• Mul Gam: ${family.originalVillage}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="profile-details-grid">
          {/* Section: Personal & Demographic Info */}
          <div className="detail-section-card">
            <h3 className="detail-section-title">Personal Information (અંગત વિગતો)</h3>
            
            <div className="detail-rows-list">
              {member.relationshipToHead && (
                <div className="detail-item">
                  <span className="detail-label">Relationship with Head:</span>
                  <span className="detail-value">{member.relationshipToHead}</span>
                </div>
              )}

              {formattedDob && (
                <div className="detail-item">
                  <span className="detail-label">Date of Birth (જન્મ તારીખ):</span>
                  <span className="detail-value">
                    <Calendar size={15} className="inline-icon" /> {formattedDob}
                  </span>
                </div>
              )}

              {age !== null && (
                <div className="detail-item">
                  <span className="detail-label">Current Age (ઉંમર):</span>
                  <span className="detail-value">
                    <Clock size={15} className="inline-icon" /> {age} years
                  </span>
                </div>
              )}

              {member.education && (
                <div className="detail-item">
                  <span className="detail-label">Education (અભ્યાસ):</span>
                  <span className="detail-value">
                    <GraduationCap size={15} className="inline-icon" /> {member.education}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Profession & Work */}
          {(member.occupation || member.workplaceAddress) && (
            <div className="detail-section-card">
              <h3 className="detail-section-title">Occupation & Workplace (વ્યવસાય / નોકરી)</h3>
              
              <div className="detail-rows-list">
                {member.occupation && (
                  <div className="detail-item">
                    <span className="detail-label">Occupation / Profession:</span>
                    <span className="detail-value">
                      <Briefcase size={15} className="inline-icon" /> {member.occupation}
                    </span>
                  </div>
                )}

                {member.workplaceAddress && (
                  <div className="detail-item">
                    <span className="detail-label">Workplace Address:</span>
                    <span className="detail-value">
                      <Building size={15} className="inline-icon" /> {member.workplaceAddress}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Maternal Roots (Mosal) */}
          {(member.maternalSurname || member.maternalVillage) && (
            <div className="detail-section-card">
              <h3 className="detail-section-title">Maternal Family (મોસાળની વિગતો)</h3>
              
              <div className="detail-rows-list">
                {member.maternalSurname && (
                  <div className="detail-item">
                    <span className="detail-label">Maternal Surname (મોસાળની અટક):</span>
                    <span className="detail-value">{member.maternalSurname}</span>
                  </div>
                )}

                {member.maternalVillage && (
                  <div className="detail-item">
                    <span className="detail-label">Maternal Village (મોસાળનું ગામ):</span>
                    <span className="detail-value">
                      <MapPin size={15} className="inline-icon" /> {member.maternalVillage}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Contact & Residence (Privacy Protected) */}
          <div className="detail-section-card">
            <h3 className="detail-section-title">Contact & Address (સંપર્ક અને સરનામું)</h3>
            
            <div className="detail-rows-list">
              <div className="detail-item">
                <span className="detail-label">Mobile Number:</span>
                {canShowMobile ? (
                  <span className="detail-value highlight-contact">
                    <Phone size={15} className="inline-icon" />
                    <a href={`tel:${member.mobileNumber}`}>{member.mobileNumber}</a>
                    {member.isPublicMobile === false && isAdmin && (
                      <span className="privacy-badge private">(Admin visible only)</span>
                    )}
                  </span>
                ) : (
                  <span className="detail-value text-muted">
                    <PhoneOff size={15} className="inline-icon" /> Private / Not disclosed publicly
                  </span>
                )}
              </div>

              {member.residentialAddress && (
                <div className="detail-item">
                  <span className="detail-label">Residential Address:</span>
                  {canShowAddress ? (
                    <span className="detail-value">
                      <Home size={15} className="inline-icon" /> {member.residentialAddress}
                      {member.isPublicAddress === false && isAdmin && (
                        <span className="privacy-badge private">(Admin visible only)</span>
                      )}
                    </span>
                  ) : (
                    <span className="detail-value text-muted">
                      Private / Not disclosed publicly
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Member Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Member Profile"
        message={`Are you sure you want to delete "${member.fullName}"? This action cannot be undone.`}
        confirmText="Yes, Delete Member"
        cancelText="Cancel"
        onConfirm={handleDeleteMember}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={isDeleting}
      />
    </main>
  );
}
