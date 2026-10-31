import React, { useState, useEffect } from "react";
import { FormField } from "../components/FormField";
import { calculateAge } from "../utils/calculateAge";
import { 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2
} from "lucide-react";

const COMMON_RELATIONSHIPS = [
  "પુત્ર (Son)",
  "પુત્રી (Daughter)",
  "પત્ની (Wife)",
  "પતિ (Husband)",
  "પિતા (Father)",
  "માતા (Mother)",
  "ભાઈ (Brother)",
  "બહેન (Sister)",
  "પુત્રવધૂ (Daughter-in-law)",
  "જમાઈ (Son-in-law)",
  "પૌત્ર (Grandson)",
  "પૌત્રી (Granddaughter)",
  "દોહિત્ર (Grandson - daughter's son)",
  "દોહિત્રી (Granddaughter - daughter's daughter)",
  "Other (અન્ય સંબંધ લખો)"
];

const FEMALE_KEYWORDS = [
  "પુત્રી", "પત્ની", "માતા", "બહેન", "પુત્રવધૂ", "વધૂ", "પૌત્રી", "દોહિત્રી", "કાકી", "મામી", "માસી", "ફોઈ", "ભત્રીજી", "ભાણી", "ગૃહિણી",
  "daughter", "wife", "mother", "sister", "aunt", "niece", "granddaughter", "housewife", "female", "women", "woman"
];

function isFemaleRel(rel) {
  if (!rel) return false;
  const lower = rel.toLowerCase();
  return FEMALE_KEYWORDS.some(kw => lower.includes(kw));
}

const OCCUPATION_OPTIONS = [
  "Farmer (ખેતી)",
  "Business (વેપાર / બિઝનેસ)",
  "Job / Service (નોકરી / સર્વિસ)",
  "Student (વિદ્યાર્થી / અભ્યાસ)",
  "Housewife (ગૃહિણી)",
  "Retired (નિવૃત્ત)",
  "Other (અન્ય)"
];

function parseOccupation(initialOcc, defaultType = "Farmer (ખેતી)") {
  if (!initialOcc) return { type: defaultType, detail: "" };
  const occ = initialOcc.toLowerCase();
  if (occ.includes("ગૃહિણી") || occ.includes("housewife")) {
    return { type: "Housewife (ગૃહિણી)", detail: "" };
  }
  if (occ.includes("ખેતી") || occ.includes("farmer")) {
    return { type: "Farmer (ખેતી)", detail: "" };
  }
  if (occ.includes("વિદ્યાર્થી") || occ.includes("student") || occ.includes("અભ્યાસ") || occ.includes("study")) {
    return { type: "Student (વિદ્યાર્થી / અભ્યાસ)", detail: "" };
  }
  if (occ.includes("નિવૃત્ત") || occ.includes("retired")) {
    return { type: "Retired (નિવૃત્ત)", detail: "" };
  }
  if (occ.includes("job") || occ.includes("નોકરી") || occ.includes("સર્વિસ") || occ.includes("service") || occ.includes("engineer") || occ.includes("manager") || occ.includes("teacher")) {
    return { 
      type: "Job / Service (નોકરી / સર્વિસ)", 
      detail: initialOcc.replace(/\s*\(Job\)/gi, "").replace(/\s*\(Business\/Job\)/gi, "").trim() 
    };
  }
  if (occ.includes("વેપાર") || occ.includes("business")) {
    return { 
      type: "Business (વેપાર / બિઝનેસ)", 
      detail: initialOcc.replace(/\s*\(Business\)/gi, "").replace(/\s*\(Business\/Job\)/gi, "").trim() 
    };
  }
  return { type: "Other (અન્ય)", detail: initialOcc };
}

function computeFinalOccupationAndWorkplace(occType, detail, workplace) {
  if (occType === "Farmer (ખેતી)") return { occupation: "ખેતી (Farmer)", workplace: "" };
  if (occType === "Housewife (ગૃહિણી)") return { occupation: "ગૃહિણી (Housewife)", workplace: "" };
  if (occType === "Student (વિદ્યાર્થી / અભ્યાસ)") return { occupation: "વિદ્યાર્થી (Student)", workplace: "" };
  if (occType === "Retired (નિવૃત્ત)") return { occupation: "નિવૃત્ત (Retired)", workplace: "" };
  if (occType === "Business (વેપાર / બિઝનેસ)") {
    return {
      occupation: detail.trim() ? `${detail.trim()} (Business)` : "વેપાર (Business)",
      workplace: (workplace || "").trim()
    };
  }
  if (occType === "Job / Service (નોકરી / સર્વિસ)") {
    return {
      occupation: detail.trim() ? `${detail.trim()} (Job)` : "નોકરી (Job)",
      workplace: (workplace || "").trim()
    };
  }
  return {
    occupation: detail.trim() || "અન્ય",
    workplace: (workplace || "").trim()
  };
}

export function FamilyForm({ 
  initialData = null, 
  initialHeadData = null, 
  onSubmit, 
  isSubmitting = false,
  isEdit = false 
}) {
  // Family core fields
  const [headFullName, setHeadFullName] = useState("");
  const [originalVillage, setOriginalVillage] = useState("");
  const [matajiMadhSthal, setMatajiMadhSthal] = useState("");

  // Head's personal details (for initial creation)
  const [showHeadDetails, setShowHeadDetails] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [education, setEducation] = useState("");
  const [headOccupationType, setHeadOccupationType] = useState("Farmer (ખેતી)");
  const [headOccupationDetail, setHeadOccupationDetail] = useState("");
  const [workplaceAddress, setWorkplaceAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [maternalSurname, setMaternalSurname] = useState("");
  const [maternalVillage, setMaternalVillage] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [isPublicMobile, setIsPublicMobile] = useState(true);
  const [isPublicAddress, setIsPublicAddress] = useState(true);

  // List of additional members to add with this family
  const [additionalMembers, setAdditionalMembers] = useState([]);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Current new member form fields
  const [memFullName, setMemFullName] = useState("");
  const [memGender, setMemGender] = useState("Male");
  const [memRelation, setMemRelation] = useState("પુત્ર (Son)");
  const [memCustomRelation, setMemCustomRelation] = useState("");
  const [memDob, setMemDob] = useState("");
  const [memEducation, setMemEducation] = useState("");
  const [memOccupationType, setMemOccupationType] = useState("Business (વેપાર / બિઝનેસ)");
  const [memOccupationDetail, setMemOccupationDetail] = useState("");
  const [memWorkplace, setMemWorkplace] = useState("");
  const [memMaternalSurname, setMemMaternalSurname] = useState("");
  const [memMaternalVillage, setMemMaternalVillage] = useState("");
  const [memAddress, setMemAddress] = useState("");
  const memPublicAddress = true;
  const [memError, setMemError] = useState("");

  // Errors & UI state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setHeadFullName(initialData.headFullName || "");
      setOriginalVillage(initialData.originalVillage || "");
      setMatajiMadhSthal(initialData.matajiMadhSthal || "");
    }
    if (initialHeadData) {
      setDateOfBirth(initialHeadData.dateOfBirth || "");
      setEducation(initialHeadData.education || "");
      
      const parsedHeadOcc = parseOccupation(initialHeadData.occupation, "Farmer (ખેતી)");
      setHeadOccupationType(parsedHeadOcc.type);
      setHeadOccupationDetail(parsedHeadOcc.detail);

      setWorkplaceAddress(initialHeadData.workplaceAddress || "");
      setMobileNumber(initialHeadData.mobileNumber || "");
      setMaternalSurname(initialHeadData.maternalSurname || "");
      setMaternalVillage(initialHeadData.maternalVillage || "");
      setResidentialAddress(initialHeadData.residentialAddress || "");
      setIsPublicMobile(initialHeadData.isPublicMobile !== false);
      setIsPublicAddress(initialHeadData.isPublicAddress !== false);
      setShowHeadDetails(true);
    }
  }, [initialData, initialHeadData]);

  const validate = () => {
    const errs = {};
    if (!headFullName.trim()) {
      errs.headFullName = "Family head's full name is required (કુટુંબના વડાનું નામ જરૂરી છે).";
    }
    if (!originalVillage.trim()) {
      errs.originalVillage = "Original village is required (મૂળ ગામ જરૂરી છે).";
    }
    if (!matajiMadhSthal.trim()) {
      errs.matajiMadhSthal = "Mataji Madh Sthal is required (માતાજીનું મઢ સ્થળ જરૂરી છે).";
    }
    if (mobileNumber && !/^[0-9+ -]{8,15}$/.test(mobileNumber.trim())) {
      errs.mobileNumber = "Please enter a valid mobile number.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleMemRelationChange = (newRel) => {
    setMemRelation(newRel);
    if (isFemaleRel(newRel)) {
      setMemGender("Female");
      if (newRel.includes("પત્ની") || newRel.includes("Wife") || newRel.includes("માતા") || newRel.includes("Mother") || newRel.includes("કાકી")) {
        setMemOccupationType("Housewife (ગૃહિણી)");
        setMemOccupationDetail("");
      } else if (newRel.includes("પુત્રી") || newRel.includes("દોહિત્રી") || newRel.includes("પૌત્રી") || newRel.includes("Daughter")) {
        setMemOccupationType("Student (વિદ્યાર્થી / અભ્યાસ)");
        setMemOccupationDetail("");
      }
    } else {
      setMemGender("Male");
      if (newRel.includes("પૌત્ર") || newRel.includes("દોહિત્ર") || newRel.includes("ભત્રીજો")) {
        setMemOccupationType("Student (વિદ્યાર્થી / અભ્યાસ)");
      } else if (memOccupationType === "Housewife (ગૃહિણી)") {
        setMemOccupationType("Job / Service (નોકરી / સર્વિસ)");
      }
    }
  };

  // Add a member to the pending member list
  const handleAddMemberToList = (keepFormOpen = false) => {
    if (!memFullName.trim()) {
      setMemError("Please enter member full name (સભ્યનું પૂરું નામ લખો).");
      return;
    }

    const relation = memRelation === "Other (અન્ય સંબંધ લખો)"
      ? (memCustomRelation.trim() || "અન્ય")
      : memRelation;

    const { occupation: finalOcc, workplace: finalWp } = computeFinalOccupationAndWorkplace(
      memOccupationType,
      memOccupationDetail,
      memWorkplace
    );

    const newMemberItem = {
      tempId: "tmp-" + Date.now() + Math.random(),
      fullName: memFullName.trim(),
      gender: isFemaleRel(relation) ? "Female" : (memGender || "Male"),
      relationshipToHead: relation,
      dateOfBirth: memDob,
      education: memEducation.trim(),
      occupation: finalOcc,
      workplaceAddress: finalWp,
      maternalSurname: memMaternalSurname.trim(),
      maternalVillage: memMaternalVillage.trim(),
      residentialAddress: memAddress.trim() || residentialAddress.trim(),
      isPublicAddress: memPublicAddress,
      photoUrl: ""
    };

    setAdditionalMembers(prev => [...prev, newMemberItem]);

    // Reset member fields for next member (clean slate, no carryover)
    setMemFullName("");
    setMemGender("Male");
    setMemRelation("પુત્ર (Son)");
    setMemCustomRelation("");
    setMemDob("");
    setMemEducation("");
    setMemOccupationType("Business (વેપાર / બિઝનેસ)");
    setMemOccupationDetail("");
    setMemWorkplace("");
    setMemMaternalSurname("");
    setMemMaternalVillage("");
    setMemAddress("");
    setMemError("");

    if (keepFormOpen) {
      setIsAddingMember(true);
    } else {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = (tempId) => {
    setAdditionalMembers(prev => prev.filter(m => m.tempId !== tempId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const familyPayload = {
      headFullName: headFullName.trim(),
      originalVillage: originalVillage.trim(),
      matajiMadhSthal: matajiMadhSthal.trim(),
      headMemberId: initialData?.headMemberId
    };

    const { occupation: finalHeadOcc, workplace: finalHeadWp } = computeFinalOccupationAndWorkplace(
      headOccupationType,
      headOccupationDetail,
      workplaceAddress
    );

    const headPayload = {
      gender: "Male",
      dateOfBirth,
      education: education.trim(),
      occupation: finalHeadOcc,
      workplaceAddress: finalHeadWp,
      mobileNumber: mobileNumber.trim(),
      maternalSurname: maternalSurname.trim(),
      maternalVillage: maternalVillage.trim(),
      residentialAddress: residentialAddress.trim(),
      isPublicMobile,
      isPublicAddress
    };

    // CRITICAL FIX: If the user typed a member in the form fields, automatically include it!
    let finalMembers = [...additionalMembers];
    if (memFullName.trim()) {
      const relation = memRelation === "Other (અન્ય સંબંધ લખો)"
        ? (memCustomRelation.trim() || "અન્ય")
        : memRelation;

      const { occupation: finalOcc, workplace: finalWp } = computeFinalOccupationAndWorkplace(
        memOccupationType,
        memOccupationDetail,
        memWorkplace
      );

      finalMembers.push({
        tempId: "tmp-" + Date.now(),
        fullName: memFullName.trim(),
        gender: isFemaleRel(relation) ? "Female" : (memGender || "Male"),
        relationshipToHead: relation,
        dateOfBirth: memDob,
        education: memEducation.trim(),
        occupation: finalOcc,
        workplaceAddress: finalWp,
        maternalSurname: memMaternalSurname.trim(),
        maternalVillage: memMaternalVillage.trim(),
        residentialAddress: memAddress.trim() || residentialAddress.trim(),
        isPublicAddress: memPublicAddress,
        photoUrl: ""
      });
    }

    onSubmit(familyPayload, headPayload, finalMembers);
  };

  const calculatedAge = calculateAge(dateOfBirth);

  return (
    <form onSubmit={handleSubmit} className="standard-form">
      {/* SECTION 1: Kutumb Head & Ancestral Details */}
      <div className="form-card">
        <h3 className="form-section-title">
          {isEdit ? "Edit Kutumb (કુટુંબ સુધારો)" : "1. Family Head & Village (કુટુંબના વડા અને મૂળ વિગતો)"}
        </h3>

        <FormField 
          label="Family Head's Full Name" 
          gujaratiLabel="કુટુંબના વડાનું પૂરું નામ"
          required 
          error={errors.headFullName}
        >
          <input
            type="text"
            className="form-control"
            value={headFullName}
            onChange={(e) => setHeadFullName(e.target.value)}
            placeholder="e.g. રમેશભાઈ ગોવિંદભાઈ પટેલ"
            disabled={isSubmitting}
          />
        </FormField>

        <div className="form-row">
          <FormField 
            label="Original Village" 
            gujaratiLabel="મૂળ ગામ"
            required 
            error={errors.originalVillage}
          >
            <input
              type="text"
              className="form-control"
              value={originalVillage}
              onChange={(e) => setOriginalVillage(e.target.value)}
              placeholder="e.g. ધરમપુર"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField 
            label="Hak nu Mataji nu Madh Sthal" 
            gujaratiLabel="હકનું માતાજીનું મઢ સ્થળ"
            required 
            error={errors.matajiMadhSthal}
          >
            <input
              type="text"
              className="form-control"
              value={matajiMadhSthal}
              onChange={(e) => setMatajiMadhSthal(e.target.value)}
              placeholder="e.g. ખોડલધામ, કાગવડ"
              disabled={isSubmitting}
            />
          </FormField>
        </div>
      </div>

      {/* SECTION 2: Head's Personal Details (Optional) */}
      {!isEdit && (
        <div className="form-card">
          <div className="toggle-section-header">
            <div>
              <h3 className="form-section-title">2. Head's Personal Details (વડાની અંગત વિગતો - વૈકલ્પિક)</h3>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowHeadDetails(!showHeadDetails)}
            >
              {showHeadDetails ? "Collapse Details" : "Add Personal Details"}
            </button>
          </div>

          {showHeadDetails && (
            <div className="expanded-head-fields">
              <div className="form-row">
                <FormField 
                  label="Date of Birth" 
                  gujaratiLabel="જન્મ તારીખ"
                  helpText={calculatedAge !== null ? `Calculated Age: ${calculatedAge} years` : ""}
                >
                  <input
                    type="date"
                    className="form-control"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Mobile Number" gujaratiLabel="મોબાઈલ નંબર" error={errors.mobileNumber}>
                  <input
                    type="tel"
                    className="form-control"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>

              <div className="form-row">
                <FormField label="Education" gujaratiLabel="અભ્યાસ">
                  <input
                    type="text"
                    className="form-control"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. Graduate / B.Com / H.S.C."
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Occupation / Category" gujaratiLabel="વ્યવસાય / કેટેગરી">
                  <select
                    className="form-control"
                    value={headOccupationType}
                    onChange={(e) => setHeadOccupationType(e.target.value)}
                    disabled={isSubmitting}
                  >
                    {OCCUPATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Head Dynamic Occupation Details */}

              {headOccupationType === "Business (વેપાર / બિઝનેસ)" && (
                <div className="form-row">
                  <FormField label="Business Details" gujaratiLabel="વેપાર / બિઝનેસની વિગત">
                    <input
                      type="text"
                      className="form-control"
                      value={headOccupationDetail}
                      onChange={(e) => setHeadOccupationDetail(e.target.value)}
                      placeholder="e.g. કરિયાણા સ્ટોર / ટેક્સટાઇલ / કન્સ્ટ્રક્શન"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField label="Shop / Workplace Address" gujaratiLabel="દુકાન / પેઢી / ઓફિસનું સરનામું">
                    <input
                      type="text"
                      className="form-control"
                      value={workplaceAddress}
                      onChange={(e) => setWorkplaceAddress(e.target.value)}
                      placeholder="e.g. દુકાન નં. 12, મેઈન બજાર, કલોલ"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              )}

              {headOccupationType === "Job / Service (નોકરી / સર્વિસ)" && (
                <div className="form-row">
                  <FormField label="Job Title / Company" gujaratiLabel="કંપની / હોદ્દો / નોકરી">
                    <input
                      type="text"
                      className="form-control"
                      value={headOccupationDetail}
                      onChange={(e) => setHeadOccupationDetail(e.target.value)}
                      placeholder="e.g. સોફ્ટવેર એન્જિનિયર / બેંક મેનેજર / શિક્ષક"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField label="Company / Office Address" gujaratiLabel="ઓફિસ / કંપનીનું સરનામું">
                    <input
                      type="text"
                      className="form-control"
                      value={workplaceAddress}
                      onChange={(e) => setWorkplaceAddress(e.target.value)}
                      placeholder="e.g. ઇન્ફોસિટી, ગાંધીનગર"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              )}

              {headOccupationType === "Other (અન્ય)" && (
                <div className="form-row">
                  <FormField label="Occupation Details" gujaratiLabel="વ્યવસાયની વિગત">
                    <input
                      type="text"
                      className="form-control"
                      value={headOccupationDetail}
                      onChange={(e) => setHeadOccupationDetail(e.target.value)}
                      placeholder="e.g. કલાકાર, લેખક, સામાજિક કાર્યકર..."
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField label="Workplace Address" gujaratiLabel="વ્યવસાયનું સરનામું">
                    <input
                      type="text"
                      className="form-control"
                      value={workplaceAddress}
                      onChange={(e) => setWorkplaceAddress(e.target.value)}
                      placeholder="સરનામું"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              )}

              <div className="form-row">
                <FormField label="Maternal Family Surname" gujaratiLabel="મોસાળની અટક">
                  <input
                    type="text"
                    className="form-control"
                    value={maternalSurname}
                    onChange={(e) => setMaternalSurname(e.target.value)}
                    placeholder="e.g. દેસાઈ"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Maternal Family Village" gujaratiLabel="મોસાળનું ગામ">
                  <input
                    type="text"
                    className="form-control"
                    value={maternalVillage}
                    onChange={(e) => setMaternalVillage(e.target.value)}
                    placeholder="e.g. ઉનાવા"
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>

              <FormField label="Residential Address" gujaratiLabel="ઘરનું પૂરું સરનામું">
                <textarea
                  className="form-control"
                  rows={2}
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                  placeholder="Complete residential address"
                  disabled={isSubmitting}
                />
              </FormField>

              <div className="privacy-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isPublicMobile}
                    onChange={(e) => setIsPublicMobile(e.target.checked)}
                  />
                  <span>Show Mobile Number publicly (સાર્વજનિક મોબાઈલ દર્શાવવો)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isPublicAddress}
                    onChange={(e) => setIsPublicAddress(e.target.checked)}
                  />
                  <span>Show Residential Address publicly (સાર્વજનિક સરનામું દર્શાવવો)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: INLINE FAMILY MEMBERS (Add Son, Daughter, Wife, etc. in same page) */}
      {!isEdit && (
        <div className="form-card members-inline-card">
          <div className="section-header-row">
            <div>
              <h3 className="form-section-title">
                3. Add Family Members (કુટુંબના સભ્યો ઉમેરો)
              </h3>
            </div>
            <span className="count-pill">
              {additionalMembers.length} Added
            </span>
          </div>

          {/* List of members added so far */}
          {additionalMembers.length > 0 && (
            <div className="inline-members-list">
              {additionalMembers.map((mem, index) => {
                const memAge = calculateAge(mem.dateOfBirth);
                return (
                  <div key={mem.tempId} className="inline-member-badge-item">
                    <div className="inline-mem-info">
                      <span className="inline-mem-num">{index + 1}.</span>
                      <strong className="inline-mem-name">{mem.fullName}</strong>
                      <span className="relation-pill">{mem.relationshipToHead}</span>
                      {memAge !== null && (
                        <span className="inline-mem-meta">Age: {memAge} yrs</span>
                      )}
                      {mem.occupation && (
                        <span className="inline-mem-meta">• {mem.occupation}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(mem.tempId)}
                      className="btn-remove-inline"
                      title="Remove this member"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Inline Member Entry Form */}
          {isAddingMember ? (
            <div className="inline-member-form-box">
              <div className="inline-form-top">
                <h4>New Member Details (નવા સભ્યની વિગત)</h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => setIsAddingMember(false)}
                >
                  Cancel
                </button>
              </div>

              {memError && (
                <div className="alert-box error" style={{ padding: '0.5rem', marginBottom: '0.75rem' }}>
                  <AlertCircle size={15} />
                  <span>{memError}</span>
                </div>
              )}

              <div className="form-row">
                <FormField label="Member Full Name" gujaratiLabel="સભ્યનું પૂરું નામ" required>
                  <input
                    type="text"
                    className="form-control"
                    value={memFullName}
                    onChange={(e) => setMemFullName(e.target.value)}
                    placeholder="e.g. ચિંતન રમેશભાઈ પટેલ"
                  />
                </FormField>

                <FormField label="Relationship with Head" gujaratiLabel="કુટુંબના વડા સાથેનો સંબંધ" required>
                  <select
                    className="form-control"
                    value={memRelation}
                    onChange={(e) => handleMemRelationChange(e.target.value)}
                  >
                    {COMMON_RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {memRelation === "Other (અન્ય સંબંધ લખો)" && (
                <FormField label="Specify Relationship" gujaratiLabel="સંબંધ વિગતવાર લખો" required>
                  <input
                    type="text"
                    className="form-control"
                    value={memCustomRelation}
                    onChange={(e) => setMemCustomRelation(e.target.value)}
                    placeholder="e.g. ભાણેજ, સાળો, દિયર..."
                  />
                </FormField>
              )}

              <div className="form-row">
                <FormField label="Gender" gujaratiLabel="જાતિ" required>
                  <select
                    className="form-control"
                    value={memGender}
                    onChange={(e) => setMemGender(e.target.value)}
                  >
                    <option value="Male">Male (પુરુષ)</option>
                    <option value="Female">Female (સ્ત્રી)</option>
                  </select>
                </FormField>

                <FormField label="Date of Birth" gujaratiLabel="જન્મ તારીખ">
                  <input
                    type="date"
                    className="form-control"
                    value={memDob}
                    onChange={(e) => setMemDob(e.target.value)}
                  />
                </FormField>
              </div>

              <div className="form-row">
                <FormField label="Occupation / Category" gujaratiLabel="વ્યવસાય / કેટેગરી" required>
                  <select
                    className="form-control"
                    value={memOccupationType}
                    onChange={(e) => setMemOccupationType(e.target.value)}
                  >
                    {OCCUPATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Dynamic Section for Inline Member based on Occupation */}
              <div className="inline-occupation-dynamic-box">
                {memOccupationType === "Farmer (ખેતી)" && (
                  <div className="form-row">
                    <FormField label="Education (Optional)" gujaratiLabel="અભ્યાસ (જો હોય તો)">
                      <input
                        type="text"
                        className="form-control"
                        value={memEducation}
                        onChange={(e) => setMemEducation(e.target.value)}
                        placeholder="e.g. ધોરણ 10 / B.A. / H.S.C."
                      />
                    </FormField>

                    <FormField label="Maternal Village" gujaratiLabel="મોસાળનું ગામ">
                      <input
                        type="text"
                        className="form-control"
                        value={memMaternalVillage}
                        onChange={(e) => setMemMaternalVillage(e.target.value)}
                        placeholder="e.g. ઉનાવા / માણસા"
                      />
                    </FormField>
                  </div>
                )}

                {memOccupationType === "Student (વિદ્યાર્થી / અભ્યાસ)" && (
                  <div className="form-row">
                    <FormField label="Education / Studies / Standard" gujaratiLabel="અભ્યાસની વિગત (ધોરણ / કોલેજ / ડિગ્રી)" required>
                      <input
                        type="text"
                        className="form-control"
                        value={memEducation}
                        onChange={(e) => setMemEducation(e.target.value)}
                        placeholder="e.g. ધોરણ 10 / ધોરણ 12 / B.Tech / MBBS / B.Com / MBA"
                      />
                    </FormField>

                    <FormField label="Maternal Village" gujaratiLabel="મોસાળનું ગામ">
                      <input
                        type="text"
                        className="form-control"
                        value={memMaternalVillage}
                        onChange={(e) => setMemMaternalVillage(e.target.value)}
                        placeholder="e.g. ઉનાવા / માણસા"
                      />
                    </FormField>
                  </div>
                )}

                {memOccupationType === "Housewife (ગૃહિણી)" && (
                  <div className="form-row">
                    <FormField label="Education (Optional)" gujaratiLabel="અભ્યાસ (જો હોય તો)">
                      <input
                        type="text"
                        className="form-control"
                        value={memEducation}
                        onChange={(e) => setMemEducation(e.target.value)}
                        placeholder="e.g. B.A. / ધોરણ 12 / B.Com"
                      />
                    </FormField>

                    <FormField label="Maternal Village" gujaratiLabel="મોસાળનું ગામ">
                      <input
                        type="text"
                        className="form-control"
                        value={memMaternalVillage}
                        onChange={(e) => setMemMaternalVillage(e.target.value)}
                        placeholder="e.g. ઉનાવા / માણસા"
                      />
                    </FormField>
                  </div>
                )}

                {memOccupationType === "Retired (નિવૃત્ત)" && (
                  <div className="form-row">
                    <FormField label="Education (Optional)" gujaratiLabel="અભ્યાસ (જો હોય તો)">
                      <input
                        type="text"
                        className="form-control"
                        value={memEducation}
                        onChange={(e) => setMemEducation(e.target.value)}
                        placeholder="e.g. Graduate / B.Com"
                      />
                    </FormField>

                    <FormField label="Maternal Village" gujaratiLabel="મોસાળનું ગામ">
                      <input
                          type="text"
                          className="form-control"
                          value={memMaternalVillage}
                          onChange={(e) => setMemMaternalVillage(e.target.value)}
                          placeholder="e.g. ઉનાવા / માણસા"
                        />
                      </FormField>
                    </div>
                )}

                {memOccupationType === "Business (વેપાર / બિઝનેસ)" && (
                  <>
                    <div className="form-row">
                      <FormField label="Business Details" gujaratiLabel="વેપાર / બિઝનેસની વિગત" required>
                        <input
                          type="text"
                          className="form-control"
                          value={memOccupationDetail}
                          onChange={(e) => setMemOccupationDetail(e.target.value)}
                          placeholder="e.g. ટેક્સટાઇલ / કરિયાણા સ્ટોર / કન્સ્ટ્રક્શન"
                        />
                      </FormField>

                      <FormField label="Workplace Address" gujaratiLabel="દુકાન / પેઢી / ઓફિસનું સરનામું">
                        <input
                          type="text"
                          className="form-control"
                          value={memWorkplace}
                          onChange={(e) => setMemWorkplace(e.target.value)}
                          placeholder="દુકાન, ઓફિસ કે વ્યવસાયનું સ્થળ"
                        />
                      </FormField>
                    </div>

                    <div className="form-row">
                      <FormField label="Education" gujaratiLabel="અભ્યાસ">
                        <input
                          type="text"
                          className="form-control"
                          value={memEducation}
                          onChange={(e) => setMemEducation(e.target.value)}
                          placeholder="e.g. B.Com / MBA / Graduate"
                        />
                      </FormField>

                      <FormField label="Maternal Village" gujaratiLabel="મોસાળનું ગામ">
                        <input
                          type="text"
                          className="form-control"
                          value={memMaternalVillage}
                          onChange={(e) => setMemMaternalVillage(e.target.value)}
                          placeholder="e.g. ઉનાવા / માણસા"
                        />
                      </FormField>
                    </div>
                  </>
                )}

                {memOccupationType === "Job / Service (નોકરી / સર્વિસ)" && (
                  <>
                    <div className="form-row">
                      <FormField label="Job Title / Company" gujaratiLabel="કંપની / હોદ્દો / નોકરી" required>
                        <input
                          type="text"
                          className="form-control"
                          value={memOccupationDetail}
                          onChange={(e) => setMemOccupationDetail(e.target.value)}
                          placeholder="e.g. સોફ્ટવેર એન્જિનિયર / બેંક મેનેજર / શિક્ષક"
                        />
                      </FormField>

                      <FormField label="Workplace Address" gujaratiLabel="ઓફિસ / કંપનીનું સરનામું">
                        <input
                          type="text"
                          className="form-control"
                          value={memWorkplace}
                          onChange={(e) => setMemWorkplace(e.target.value)}
                          placeholder="e.g. ઇન્ફોસિટી, ગાંધીનગર"
                        />
                      </FormField>
                    </div>

                    <div className="form-row">
                      <FormField label="Education" gujaratiLabel="અભ્યાસ">
                        <input
                          type="text"
                          className="form-control"
                          value={memEducation}
                          onChange={(e) => setMemEducation(e.target.value)}
                          placeholder="e.g. B.Tech / M.Sc. / B.Com"
                        />
                      </FormField>

                      <FormField label="Maternal Village" gujaratiLabel="મોસાળનું ગામ">
                        <input
                          type="text"
                          className="form-control"
                          value={memMaternalVillage}
                          onChange={(e) => setMemMaternalVillage(e.target.value)}
                          placeholder="e.g. ઉનાવા / માણસા"
                        />
                      </FormField>
                    </div>
                  </>
                )}

                {memOccupationType === "Other (અન્ય)" && (
                  <>
                    <div className="form-row">
                      <FormField label="Occupation Details" gujaratiLabel="વ્યવસાયની વિગત" required>
                        <input
                          type="text"
                          className="form-control"
                          value={memOccupationDetail}
                          onChange={(e) => setMemOccupationDetail(e.target.value)}
                          placeholder="e.g. કલાકાર, લેખક, સામાજિક કાર્યકર..."
                        />
                      </FormField>

                      <FormField label="Workplace Address" gujaratiLabel="વ્યવસાયનું સરનામું">
                        <input
                          type="text"
                          className="form-control"
                          value={memWorkplace}
                          onChange={(e) => setMemWorkplace(e.target.value)}
                          placeholder="સરનામું"
                        />
                      </FormField>
                    </div>

                    <div className="form-row">
                      <FormField label="Education" gujaratiLabel="અભ્યાસ">
                        <input
                          type="text"
                          className="form-control"
                          value={memEducation}
                          onChange={(e) => setMemEducation(e.target.value)}
                          placeholder="e.g. Graduate"
                        />
                      </FormField>

                      <FormField label="Maternal Village" gujaratiLabel="મોસાળનું ગામ">
                        <input
                          type="text"
                          className="form-control"
                          value={memMaternalVillage}
                          onChange={(e) => setMemMaternalVillage(e.target.value)}
                          placeholder="e.g. ઉનાવા / માણસા"
                        />
                      </FormField>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons for adding this member */}
              <div className="inline-add-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleAddMemberToList(false)}
                >
                  <CheckCircle2 size={16} />
                  <span>Add Member (સભ્ય ઉમેરો)</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleAddMemberToList(true)}
                >
                  <Plus size={16} />
                  <span>Add & Add Another (આ સભ્ય ઉમેરો અને બીજો ઉમેરો)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="add-another-member-row">
              <button
                type="button"
                className="btn btn-secondary btn-block add-member-prompt-btn"
                onClick={() => setIsAddingMember(true)}
              >
                <Plus size={18} />
                <span>
                  {additionalMembers.length > 0 
                    ? "+ Add Another Member (બીજો સભ્ય ઉમેરો)" 
                    : "+ Add Family Member (કુટુંબના સભ્ય ઉમેરો)"}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Form Submit Button */}
      <div className="form-actions sticky-form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? "Saving Complete Record..." 
            : isEdit 
              ? "Update Kutumb" 
              : `Save Kutumb with ${1 + additionalMembers.length + (memFullName.trim() ? 1 : 0)} Members (કુટુંબ સાચવો)`}
        </button>
      </div>
    </form>
  );
}
