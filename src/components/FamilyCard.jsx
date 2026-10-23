import React from "react";
import { Link } from "react-router-dom";
import { Users, MapPin, Sparkles, ChevronRight } from "lucide-react";

export function FamilyCard({ family }) {
  const familyId = family.id || family.familyId;

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
        <span className="view-details-text">View Family Details</span>
        <ChevronRight size={16} className="arrow-icon" />
      </div>
    </Link>
  );
}
