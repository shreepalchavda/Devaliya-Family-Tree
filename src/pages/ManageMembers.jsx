import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllFamilies } from "../services/familyService";
import { getLocalMembers } from "../services/localStore";
import { deleteMember } from "../services/memberService";
import { calculateAge } from "../utils/calculateAge";
import { ConfirmModal } from "../components/ConfirmModal";
import { 
  Users, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  ArrowLeft, 
  User, 
  Crown,
  Filter 
} from "lucide-react";

export function ManageMembers() {
  const [members, setMembers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [familyMap, setFamilyMap] = useState({});
  const [search, setSearch] = useState("");
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const fams = await getAllFamilies();
      setFamilies(fams);
      
      const fMap = {};
      fams.forEach(f => {
        fMap[f.id] = f;
        if (f.familyId) fMap[f.familyId] = f;
      });
      setFamilyMap(fMap);

      const mems = getLocalMembers();
      setMembers(mems);
    } catch (err) {
      console.error("Error loading members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMember(memberToDelete.id || memberToDelete.memberId, memberToDelete.familyId);
      setMemberToDelete(null);
      await loadData();
    } catch (err) {
      console.error("Failed to delete member:", err);
      alert("Failed to delete member: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase().trim();
    const family = familyMap[m.familyId];

    if (selectedFamilyFilter !== "ALL" && m.familyId !== selectedFamilyFilter) {
      return false;
    }

    if (!q) return true;

    return (
      (m.fullName && m.fullName.toLowerCase().includes(q)) ||
      (m.relationshipToHead && m.relationshipToHead.toLowerCase().includes(q)) ||
      (m.occupation && m.occupation.toLowerCase().includes(q)) ||
      (m.education && m.education.toLowerCase().includes(q)) ||
      (m.maternalVillage && m.maternalVillage.toLowerCase().includes(q)) ||
      (family?.headFullName && family.headFullName.toLowerCase().includes(q))
    );
  });

  return (
    <main className="page-container">
      <div className="page-top-nav">
        <Link to="/admin" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="manage-header-row">
        <div>
          <h1 className="page-title">Manage Members (સભ્યોનું સંચાલન)</h1>
          <p className="page-subtitle">
            Search, review, and manage member profiles across all families
          </p>
        </div>

        <div className="filters-bar">
          <div className="table-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="table-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, relation, education, village..."
            />
          </div>

          <div className="family-filter-dropdown">
            <Filter size={15} className="filter-icon" />
            <select
              className="form-control form-control-sm"
              value={selectedFamilyFilter}
              onChange={(e) => setSelectedFamilyFilter(e.target.value)}
            >
              <option value="ALL">All Families ({families.length})</option>
              {families.map((f) => (
                <option key={f.id || f.familyId} value={f.id || f.familyId}>
                  {f.headFullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading member directory...</p>
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="table-responsive">
          <table className="standard-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Relationship</th>
                <th>Family (કુટુંબ)</th>
                <th>Age / DOB</th>
                <th>Occupation / Education</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((mem) => {
                const memId = mem.id || mem.memberId;
                const fam = familyMap[mem.familyId];
                const age = calculateAge(mem.dateOfBirth);
                const isHead = (mem.relationshipToHead || '').toLowerCase().includes('head') || (mem.relationshipToHead || '').includes('વડા');

                return (
                  <tr key={memId}>
                    <td>
                      <div className="member-cell">
                        <div className="member-cell-avatar">
                          {mem.photoUrl ? (
                            <img src={mem.photoUrl} alt={mem.fullName} />
                          ) : isHead ? (
                            <Crown size={16} className="avatar-icon-head" />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <div>
                          <Link to={`/member/${memId}`} className="table-main-title hover-link">
                            {mem.fullName}
                          </Link>
                          {mem.mobileNumber && (
                            <div className="cell-sub">{mem.mobileNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`relation-badge ${isHead ? 'relation-badge-head' : ''}`}>
                        {mem.relationshipToHead || "Member"}
                      </span>
                    </td>
                    <td>
                      {fam ? (
                        <Link to={`/family/${fam.id || fam.familyId}`} className="hover-link">
                          {fam.headFullName}
                        </Link>
                      ) : (
                        <span className="text-muted">Unlinked</span>
                      )}
                    </td>
                    <td>
                      {age !== null ? (
                        <span>{age} yrs</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div>{mem.occupation || "—"}</div>
                      {mem.education && <div className="cell-sub">{mem.education}</div>}
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <Link
                          to={`/member/${memId}`}
                          className="btn btn-secondary btn-xs"
                          title="View Profile"
                        >
                          <ExternalLink size={13} />
                          <span>View</span>
                        </Link>
                        <Link
                          to={`/admin/members/${memId}/edit`}
                          className="btn btn-secondary btn-xs"
                          title="Edit Profile"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => setMemberToDelete(mem)}
                          className="btn btn-danger-outline btn-xs"
                          title="Delete Member"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <Users size={36} className="empty-icon" />
          <h3>No matching members found</h3>
          <p>Try modifying your search or family filter.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(memberToDelete)}
        title="Delete Member Record"
        message={`Are you sure you want to permanently delete "${memberToDelete?.fullName}"?`}
        confirmText="Yes, Delete Member"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setMemberToDelete(null)}
        isLoading={isDeleting}
      />
    </main>
  );
}
