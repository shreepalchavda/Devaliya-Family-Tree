import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMemberById, updateMember } from "../services/memberService";
import { getFamilyById } from "../services/familyService";
import { MemberForm } from "../forms/MemberForm";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export function EditMemberPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const mem = await getMemberById(memberId);
        if (!mem) {
          setError("Member not found");
        } else {
          setMember(mem);
          if (mem.familyId) {
            const fam = await getFamilyById(mem.familyId);
            setFamily(fam);
          }
        }
      } catch (err) {
        console.error("Failed to load member:", err);
        setError("Error loading member details");
      } finally {
        setLoading(false);
      }
    }

    if (memberId) {
      loadData();
    }
  }, [memberId]);

  const handleSubmit = async (memberData) => {
    setIsSubmitting(true);
    setError("");

    try {
      await updateMember(memberId, {
        ...memberData,
        familyId: member.familyId
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/member/${memberId}`);
      }, 800);
    } catch (err) {
      console.error("Failed to update member:", err);
      setError(err.message || "Failed to update member profile.");
      setIsSubmitting(false);
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

  return (
    <main className="page-container narrow-container">
      <div className="page-top-nav">
        <Link to={`/member/${memberId}`} className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Member Profile</span>
        </Link>
      </div>

      <div className="form-page-header">
        <h1 className="page-title">Edit Member Profile (સભ્ય વિગત સુધારો)</h1>
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
          <span>Member profile updated successfully! Redirecting...</span>
        </div>
      )}

      <MemberForm
        initialData={member}
        familyHeadName={family?.headFullName}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={true}
      />
    </main>
  );
}
