import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getFamilyById } from "../services/familyService";
import { createMember } from "../services/memberService";
import { MemberForm } from "../forms/MemberForm";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export function AddMemberPage() {
  const { familyId } = useParams();
  const navigate = useNavigate();

  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadFamily() {
      setLoading(true);
      try {
        const fam = await getFamilyById(familyId);
        if (!fam) {
          setError("Family not found");
        } else {
          setFamily(fam);
        }
      } catch (err) {
        console.error("Failed to fetch family:", err);
        setError("Error loading family");
      } finally {
        setLoading(false);
      }
    }

    if (familyId) {
      loadFamily();
    }
  }, [familyId]);

  const handleSubmit = async (memberData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const created = await createMember(familyId, memberData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/family/${familyId}`);
      }, 800);
    } catch (err) {
      console.error("Failed to add member:", err);
      setError(err.message || "Failed to add member. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading family...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="page-container narrow-container">
      <div className="page-top-nav">
        <Link to={`/family/${familyId}`} className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Family Details</span>
        </Link>
      </div>

      <div className="form-page-header">
        <h1 className="page-title">Add Family Member (સભ્ય ઉમેરો)</h1>
        <p className="page-subtitle">
          Adding new relative into the family of <strong>{family?.headFullName}</strong>
        </p>
      </div>

      {error && (
        <div className="alert-box error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-box success">
          <CheckCircle2 size={18} />
          <span>Member successfully added! Redirecting to family...</span>
        </div>
      )}

      <MemberForm
        familyHeadName={family?.headFullName}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={false}
      />
    </main>
  );
}
