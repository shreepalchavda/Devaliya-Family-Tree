import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createFamilyWithHead } from "../services/familyService";
import { FamilyForm } from "../forms/FamilyForm";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export function AddFamilyPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (familyData, headMemberData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const createdFamily = await createFamilyWithHead(familyData, headMemberData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/family/${createdFamily.id || createdFamily.familyId}`);
      }, 1000);
    } catch (err) {
      console.error("Failed to create family:", err);
      setError(err.message || "Failed to create family record. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-container narrow-container">
      <div className="page-top-nav">
        <Link to="/admin/families" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Manage Families</span>
        </Link>
      </div>

      <div className="form-page-header">
        <h1 className="page-title">Add Kutumb (નવું કુટુંબ ઉમેરો)</h1>
        <p className="page-subtitle">
          Register a new family unit and create the designated family head record
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
          <span>Family successfully created! Redirecting to family details...</span>
        </div>
      )}

      <FamilyForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        isEdit={false} 
      />
    </main>
  );
}
