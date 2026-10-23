import React from "react";
import { Link } from "react-router-dom";
import { calculateAge } from "../utils/calculateAge";
import { User, Briefcase, GraduationCap, MapPin, ChevronRight, Crown } from "lucide-react";

export function MemberCard({ member }) {
  const memberId = member.id || member.memberId;
  const age = calculateAge(member.dateOfBirth);
  const isHead = (member.relationshipToHead || '').toLowerCase().includes('head') || (member.relationshipToHead || '').includes('વડા');

  return (
    <Link 
      to={`/member/${memberId}`} 
      className={`member-card ${isHead ? 'member-card-head' : ''}`}
      aria-label={`View details of ${member.fullName}`}
    >
      <div className="member-avatar-box">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={member.fullName} className="member-avatar-img" />
        ) : (
          <div className="member-avatar-placeholder">
            {isHead ? <Crown size={22} className="avatar-icon-head" /> : <User size={22} />}
          </div>
        )}
      </div>

      <div className="member-info-content">
        <div className="member-header-row">
          <h4 className="member-name">{member.fullName}</h4>
          <span className={`relation-badge ${isHead ? 'relation-badge-head' : ''}`}>
            {member.relationshipToHead || "Family Member"}
          </span>
        </div>

        <div className="member-meta-grid">
          {age !== null && (
            <span className="member-meta-item">
              <strong>Age:</strong> {age} yrs
            </span>
          )}

          {member.occupation && (
            <span className="member-meta-item">
              <Briefcase size={13} />
              <span>{member.occupation}</span>
            </span>
          )}

          {member.education && (
            <span className="member-meta-item">
              <GraduationCap size={13} />
              <span>{member.education}</span>
            </span>
          )}

          {member.maternalVillage && (
            <span className="member-meta-item">
              <MapPin size={13} />
              <span>Mosal: {member.maternalVillage}</span>
            </span>
          )}
        </div>
      </div>

      <div className="member-card-arrow">
        <ChevronRight size={18} />
      </div>
    </Link>
  );
}
