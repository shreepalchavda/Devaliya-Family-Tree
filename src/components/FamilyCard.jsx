import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, MapPin, Sparkles, ChevronRight, FileDown } from "lucide-react";
import { downloadFamilyPdf } from "../utils/exportFamilyPdf";

export function FamilyCard({ family }) {
  const familyId = family.id || family.familyId;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadFamilyPdf(family);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Link to={`/family/${familyId}`} className="family-card" aria-label={`View family of ${family.headFullName}`}>
      <div className="family-card-header">
        <div className="family-head-badge">
          <span className="badge-label">Kutumb / Family</span>
          <span className="badge-count">
            <Users size={14} />
            {family.memberCount ?? 0} {family.memberCount === 1 ? 'Member' : 'Members'}
          </span>
        </div>
        <h3 className="family-head-name">{family.headFullName}</h3>
      </div>

      <div className="family-card-body">
        {family.originalVillage && (
          <div className="family-meta-row">
            <MapPin size={15} className="meta-icon" />
            <span className="meta-label">Mul Gam:</span>
            <span className="meta-value">{family.originalVillage}</span>
          </div>
        )}

        {family.matajiMadhSthal && (
          <div className="family-meta-row">
            <Sparkles size={15} className="meta-icon" />
            <span className="meta-label">Mataji Madh:</span>
            <span className="meta-value">{family.matajiMadhSthal}</span>
          </div>
        )}
      </div>

      <div className="family-card-footer">
        <div className="view-link-group">
          <span className="view-details-text">View Family Details</span>
          <ChevronRight size={16} className="arrow-icon" />
        </div>

        <button
          type="button"
          className="family-pdf-btn"
          onClick={handleDownload}
          disabled={downloading}
          title="Download Family PDF (કુટુંબ વિગત PDF ડાઉનલોડ)"
          aria-label="Download Family PDF"
        >
          {downloading ? (
            <span className="pdf-btn-spinner" />
          ) : (
            <FileDown size={14} className="pdf-btn-icon" />
          )}
          <span>{downloading ? "PDF..." : "PDF"}</span>
        </button>
      </div>
    </Link>
  );
}
