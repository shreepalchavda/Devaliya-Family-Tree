import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getFamilyById, updateFamily } from "../services/familyService";
import { FamilyForm } from "../forms/FamilyForm";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export function EditFamilyPage() {
  const { familyId } = useParams();
  const navigate = useNavigate();

  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const fam = await getFamilyById(familyId);
        if (!fam) {
          setError("Family not found");
        } else {
          setFamily(fam);
        }
      } catch (err) {
        console.error("Failed to load family:", err);
        setError("Error loading family details");
      } finally {
        setLoading(false);
      }
    }

    if (familyId) {
      loadData();
    }
  }, [familyId]);

  const handleSubmit = async (familyData) => {
    setIsSubmitting(true);
    setError("");

    try {
      await updateFamily(familyId, familyData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/family/${familyId}`);
      }, 800);
    } catch (err) {
      console.error("Failed to update family:", err);
      setError(err.message || "Failed to update family information.");
      setIsSubmitting(false);
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

  if (error && !family) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>{error}</h2>
          <Link to="/admin/families" className="btn btn-secondary">
            Return to Manage Families
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="page-container narrow-container">
      <div className="page-top-nav">
        <Link to={`/family/${familyId}`} className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Family</span>
        </Link>
      </div>

      <div className="form-page-header">
        <h1 className="page-title">Edit Kutumb (કુટુંબ વિગત સુધારો)</h1>
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
          <span>Family updated successfully! Redirecting...</span>
        </div>
      )}

      <FamilyForm
        initialData={family}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={true}
      />
    </main>
  );
}
