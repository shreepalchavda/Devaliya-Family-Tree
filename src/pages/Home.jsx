import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllFamilies } from "../services/familyService";
import { searchMembersAndFamilies } from "../services/memberService";
import { SearchBar } from "../components/SearchBar";
import { FamilyCard } from "../components/FamilyCard";
import { calculateAge } from "../utils/calculateAge";
import { Users, Home as HomeIcon, Search, User, ChevronRight, Briefcase, MapPin } from "lucide-react";

export function Home() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState({ totalFamilies: 0, totalMembers: 0 });

  useEffect(() => {
    let isInitial = true;

    async function loadData() {
      if (isInitial) setLoading(true);
      try {
        const fams = await getAllFamilies();
        setFamilies(fams);

        // Compute total members accurately
        const totalF = fams.length;
        const totalM = fams.reduce((acc, f) => acc + (f.memberCount || 0), 0);
        setStats({ totalFamilies: totalF, totalMembers: totalM });
      } catch (err) {
        console.error("Error loading families:", err);
      } finally {
        if (isInitial) {
          setLoading(false);
          isInitial = false;
        }
      }
    }

    loadData();

    // Auto-refresh when tab is focused / becomes visible
    const handleFocus = () => {
      loadData();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    // Continuous 3-second sync poll so cross-port changes reflect immediately
    const interval = setInterval(loadData, 3000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, []);

  // Handle live search
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchMembersAndFamilies(query);
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <main className="page-container">
      {/* Search & Hero Section */}
      <section className="hero-section">
        <h1 className="main-title">Family Directory</h1>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="શોધો: સભ્યનું નામ, વડાનું નામ, મૂળ ગામ, મોસાળ અટક, વ્યવસાય... / Search by name, village, occupation"
        />

        {/* Directory Statistics */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{stats.totalFamilies}</span>
            <span className="stat-label">Total Families (કુલ કુટુંબ)</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalMembers}</span>
            <span className="stat-label">Total Members (કુલ સભ્યો)</span>
          </div>
        </div>
      </section>

      {/* Content Area: Search Results OR Family Grid */}
      <section className="directory-content-section">
        {searchQuery.trim() ? (
          <div className="search-results-container">
            <div className="results-header">
              <h2>Search Results ({searchResults.length})</h2>
              <span className="results-for-text">Matching &ldquo;{searchQuery}&rdquo;</span>
            </div>

            {isSearching ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Searching directory...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="search-results-list">
                {searchResults.map(({ member, family }) => {
                  const memberId = member.id || member.memberId;
                  const age = calculateAge(member.dateOfBirth);
                  return (
                    <Link
                      to={`/member/${memberId}`}
                      key={memberId}
                      className="search-result-item"
                    >
                      <div className="search-result-avatar">
                        <User size={22} />
                      </div>

                      <div className="search-result-info">
                        <div className="search-result-top">
                          <h4 className="search-member-name">{member.fullName}</h4>
                          <span className="relation-pill">{member.relationshipToHead || "Member"}</span>
                        </div>

                        <div className="search-result-meta">
                          {family && (
                            <span className="meta-pill family-pill">
                              <strong>Family:</strong> {family.headFullName}
                            </span>
                          )}

                          {family?.originalVillage && (
                            <span className="meta-pill">
                              <MapPin size={12} />
                              {family.originalVillage}
                            </span>
                          )}

                          {member.occupation && (
                            <span className="meta-pill">
                              <Briefcase size={12} />
                              {member.occupation}
                            </span>
                          )}

                          {member.maternalVillage && (
                            <span className="meta-pill">
                              <strong>Mosal:</strong> {member.maternalVillage}
                            </span>
                          )}

                          {age !== null && (
                            <span className="meta-pill">
                              {age} yrs
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight size={20} className="result-arrow" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <Search size={36} className="empty-icon" />
                <h3>No matching members or families found</h3>
                <p>Try searching with another spelling, village name, or occupation.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="families-grid-container">
            <div className="section-header-row">
              <h2 className="section-title">All Families (બધા કુટુંબ)</h2>
              <span className="section-count">{families.length} Families</span>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading directory...</p>
              </div>
            ) : families.length > 0 ? (
              <div className="family-cards-grid">
                {families.map((family) => (
                  <FamilyCard key={family.id || family.familyId} family={family} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Users size={36} className="empty-icon" />
                <h3>No family records found</h3>
                <p>Families will appear here once added by an administrator.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
