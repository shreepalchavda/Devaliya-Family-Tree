import React, { useState, useEffect } from "react";
import { FormField } from "../components/FormField";
import { calculateAge } from "../utils/calculateAge";

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
  "કાકા (Uncle - father's brother)",
  "કાકી (Aunt - father's brother's wife)",
  "ભત્રીજો (Nephew - brother's son)",
  "ભત્રીજી (Niece - brother's daughter)",
  "Other (અન્ય સંબંધ લખો)"
];

const FEMALE_KEYWORDS = [
  "પુત્રી", "પત્ની", "માતા", "બહેન", "પુત્રવધૂ", "પૌત્રી", "દોહિત્રી", "કાકી", "ભત્રીજી",
  "daughter", "wife", "mother", "sister", "aunt", "niece", "granddaughter"
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

function parseOccupation(initialOcc) {
  if (!initialOcc) return { type: "Business (વેપાર / બિઝનેસ)", detail: "" };
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

export function MemberForm({ 
  initialData = null, 
  familyHeadName = "", 
  onSubmit, 
  isSubmitting = false,
  isEdit = false 
}) {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Male");
  const [relationshipType, setRelationshipType] = useState("પુત્ર (Son)");
  const [customRelationship, setCustomRelationship] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [education, setEducation] = useState("");
  const [occupationType, setOccupationType] = useState("Business (વેપાર / બિઝનેસ)");
  const [occupationDetail, setOccupationDetail] = useState("");
  const [workplaceAddress, setWorkplaceAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [maternalSurname, setMaternalSurname] = useState("");
  const [maternalVillage, setMaternalVillage] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [isPublicMobile, setIsPublicMobile] = useState(true);
  const [isPublicAddress, setIsPublicAddress] = useState(true);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || "");
      
      const foundInCommon = COMMON_RELATIONSHIPS.find(r => r === initialData.relationshipToHead);
      let detectedRel = "પુત્ર (Son)";
      if (foundInCommon) {
        detectedRel = foundInCommon;
        setRelationshipType(foundInCommon);
      } else if (initialData.relationshipToHead) {
        detectedRel = initialData.relationshipToHead;
        setRelationshipType("Other (અન્ય સંબંધ લખો)");
        setCustomRelationship(initialData.relationshipToHead);
      }

      // Detect gender
      const detectedGender = initialData.gender || (isFemaleRel(detectedRel) ? "Female" : "Male");
      setGender(detectedGender);

      setDateOfBirth(initialData.dateOfBirth || "");
      setEducation(initialData.education || "");
      
      // Parse occupation into smart category + detail
      const parsed = parseOccupation(initialData.occupation);
      setOccupationType(parsed.type);
      setOccupationDetail(parsed.detail);

      setWorkplaceAddress(initialData.workplaceAddress || "");
      setMobileNumber(initialData.mobileNumber || "");
      setMaternalSurname(initialData.maternalSurname || "");
      setMaternalVillage(initialData.maternalVillage || "");
      setResidentialAddress(initialData.residentialAddress || "");
      setIsPublicMobile(initialData.isPublicMobile !== false);
      setIsPublicAddress(initialData.isPublicAddress !== false);
    }
  }, [initialData]);

  const calculatedAge = calculateAge(dateOfBirth);
  const isHead = (relationshipType || '').toLowerCase().includes('head') || (relationshipType || '').includes('વડા');

  const handleRelationshipChange = (newRel) => {
    setRelationshipType(newRel);
    if (isFemaleRel(newRel)) {
      setGender("Female");
      if (newRel.includes("પત્ની") || newRel.includes("Wife") || newRel.includes("માતા") || newRel.includes("Mother") || newRel.includes("કાકી")) {
        setOccupationType("Housewife (ગૃહિણી)");
        setOccupationDetail("");
      } else if (newRel.includes("પુત્રી") || newRel.includes("દોહિત્રી") || newRel.includes("પૌત્રી") || newRel.includes("Daughter")) {
        setOccupationType("Student (વિદ્યાર્થી / અભ્યાસ)");
        setOccupationDetail("");
      }
    } else {
      setGender("Male");
      if (newRel.includes("પૌત્ર") || newRel.includes("દોહિત્ર") || newRel.includes("ભત્રીજો")) {
        setOccupationType("Student (વિદ્યાર્થી / અભ્યાસ)");
      } else if (occupationType === "Housewife (ગૃહિણી)") {
        setOccupationType("Job / Service (નોકરી / સર્વિસ)");
      }
    }
  };

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    if (newGender === "Female" && occupationType === "Job / Service (નોકરી / સર્વિસ)") {
      setOccupationType("Housewife (ગૃહિણી)");
    } else if (newGender === "Male" && occupationType === "Housewife (ગૃહિણી)") {
      setOccupationType("Business (વેપાર / બિઝનેસ)");
    }
  };

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = "Member full name is required (સભ્યનું પૂરું નામ જરૂરી છે).";
    }
    if (relationshipType === "Other (અન્ય સંબંધ લખો)" && !customRelationship.trim()) {
      errs.relationship = "Please specify the relationship with the family head.";
    }
    if (isHead && mobileNumber && !/^[0-9+ -]{8,15}$/.test(mobileNumber.trim())) {
      errs.mobileNumber = "Please enter a valid mobile number.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e, isAddAnother = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    const relationshipToHead = 
      relationshipType === "Other (અન્ય સંબંધ લખો)" 
        ? customRelationship.trim() 
        : relationshipType;

    // Smart occupation and workplace calculation
    let finalOccupation = "";
    let finalWorkplace = "";

    if (occupationType === "Farmer (ખેતી)") {
      finalOccupation = "ખેતી (Farmer)";
      finalWorkplace = "";
    } else if (occupationType === "Housewife (ગૃહિણી)") {
      finalOccupation = "ગૃહિણી (Housewife)";
      finalWorkplace = "";
    } else if (occupationType === "Student (વિદ્યાર્થી / અભ્યાસ)") {
      finalOccupation = "વિદ્યાર્થી (Student)";
      finalWorkplace = "";
    } else if (occupationType === "Retired (નિવૃત્ત)") {
      finalOccupation = "નિવૃત્ત (Retired)";
      finalWorkplace = "";
    } else if (occupationType === "Business (વેપાર / બિઝનેસ)") {
      finalOccupation = occupationDetail.trim() 
        ? `${occupationDetail.trim()} (Business)` 
        : "વેપાર (Business)";
      finalWorkplace = workplaceAddress.trim();
    } else if (occupationType === "Job / Service (નોકરી / સર્વિસ)") {
      finalOccupation = occupationDetail.trim() 
        ? `${occupationDetail.trim()} (Job)` 
        : "નોકરી (Job)";
      finalWorkplace = workplaceAddress.trim();
    } else {
      finalOccupation = occupationDetail.trim() || "અન્ય";
      finalWorkplace = workplaceAddress.trim();
    }

    const payload = {
      fullName: fullName.trim(),
      gender,
      relationshipToHead,
      dateOfBirth,
      education: education.trim(),
      occupation: finalOccupation,
      workplaceAddress: finalWorkplace,
      ...(isHead && mobileNumber.trim() ? { mobileNumber: mobileNumber.trim(), isPublicMobile } : {}),
      maternalSurname: maternalSurname.trim(),
      maternalVillage: maternalVillage.trim(),
      residentialAddress: residentialAddress.trim(),
      isPublicAddress
    };

    onSubmit(payload, isAddAnother);

    if (isAddAnother) {
      // Clear fields for the next member (fresh blank form, no carryover)
      setFullName("");
      setRelationshipType("પુત્ર (Son)");
      setCustomRelationship("");
      setGender("Male");
      setDateOfBirth("");
      setEducation("");
      setOccupationType("Business (વેપાર / બિઝનેસ)");
      setOccupationDetail("");
      setWorkplaceAddress("");
      setMobileNumber("");
      setMaternalSurname("");
      setMaternalVillage("");
      setResidentialAddress("");
      setErrors({});
    }
  };

  const handleSubmit = (e) => {
    handleFormSubmit(e, false);
  };

  return (
    <form onSubmit={handleSubmit} className="standard-form">
      <div className="form-card">
        <h3 className="form-section-title">
          {isEdit ? "Edit Member Profile (સભ્ય સુધારો)" : "Member Information (સભ્યની વિગત)"}
        </h3>
        {familyHeadName && (
          <p className="form-section-desc">
            Family Head: <strong>{familyHeadName}</strong>
          </p>
        )}

        <div className="form-row">
          <FormField 
            label="Member Full Name" 
            gujaratiLabel="સભ્યનું પૂરું નામ"
            required 
            error={errors.fullName}
          >
            <input
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. ચિંતન રમેશભાઈ પટેલ"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField 
            label="Relationship with Family Head" 
            gujaratiLabel="કુટુંબના વડા સાથેનો સંબંધ"
            required 
            error={errors.relationship}
          >
            <select
              className="form-control"
              value={relationshipType}
              onChange={(e) => handleRelationshipChange(e.target.value)}
              disabled={isSubmitting}
            >
              {COMMON_RELATIONSHIPS.map((rel) => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </FormField>
        </div>

        {relationshipType === "Other (અન્ય સંબંધ લખો)" && (
          <FormField 
            label="Specify Relationship" 
            gujaratiLabel="સંબંધ વિગતવાર લખો"
            required 
            error={errors.relationship}
          >
            <input
              type="text"
              className="form-control"
              value={customRelationship}
              onChange={(e) => setCustomRelationship(e.target.value)}
              placeholder="e.g. ભાણેજ, સાળો, દિયર..."
              disabled={isSubmitting}
            />
          </FormField>
        )}

        <div className="form-row">
          <FormField 
            label="Gender" 
            gujaratiLabel="જાતિ (પુરુષ / સ્ત્રી)"
            required
          >
            <select
              className="form-control"
              value={gender}
              onChange={(e) => handleGenderChange(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="Male">Male (પુરુષ)</option>
              <option value="Female">Female (સ્ત્રી)</option>
            </select>
          </FormField>

          <FormField 
            label="Date of Birth" 
            gujaratiLabel="જન્મ તારીખ"
            helpText={calculatedAge !== null ? `Automatically calculated age: ${calculatedAge} years` : "Age will be computed automatically"}
          >
            <input
              type="date"
              className="form-control"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {isHead && (
          <div className="form-row">
            <FormField 
              label="Mobile Number (Family Head Only)" 
              gujaratiLabel="મોબાઈલ નંબર (ફક્ત કુટુંબના વડા માટે)"
              error={errors.mobileNumber}
            >
              <input
                type="tel"
                className="form-control"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 94080 76543"
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        )}

        {/* Unified Intelligent Occupation Section */}
        <div className="form-row">
          <FormField 
            label="Occupation / Category" 
            gujaratiLabel="વ્યવસાય / કેટેગરી" 
            required
            helpText="ખેતી, વેપાર, નોકરી, વિદ્યાર્થી કે ગૃહિણી પસંદ કરો"
          >
            <select
              className="form-control"
              value={occupationType}
              onChange={(e) => setOccupationType(e.target.value)}
              disabled={isSubmitting}
            >
              {OCCUPATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Dynamic fields based on Occupation Type */}
        <div className="dynamic-occupation-box">
          {/* 1. If Farmer: Nothing asked */}
          {occupationType === "Farmer (ખેતી)" && (
            <div className="form-row">
              <FormField label="Education (Optional)" gujaratiLabel="અભ્યાસ (જો હોય તો)">
                <input
                  type="text"
                  className="form-control"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. ધોરણ 10 / B.A. / H.S.C."
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          )}

          {/* 2. If Student: Prominently ask for Study/Course, no workplace! */}
          {occupationType === "Student (વિદ્યાર્થી / અભ્યાસ)" && (
            <div className="form-row">
              <FormField 
                label="Education / Studies / Standard" 
                gujaratiLabel="અભ્યાસની વિગત (ધોરણ / કોલેજ / ડિગ્રી)"
                required
                helpText="ચાલુ અભ્યાસ અથવા છેલ્લે મેળવેલી ડિગ્રી લખો"
              >
                <input
                  type="text"
                  className="form-control"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. ધોરણ 10 / ધોરણ 12 / B.Tech / MBBS / B.Com / MBA"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          )}

          {/* 3. If Housewife: Nothing asked */}
          {occupationType === "Housewife (ગૃહિણી)" && (
            <div className="form-row">
              <FormField label="Education (Optional)" gujaratiLabel="અભ્યાસ (જો હોય તો)">
                <input
                  type="text"
                  className="form-control"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. B.A. / ધોરણ 12 / B.Com"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          )}

          {/* 4. If Retired: Nothing asked */}
          {occupationType === "Retired (નિવૃત્ત)" && (
            <div className="form-row">
              <FormField label="Education (Optional)" gujaratiLabel="અભ્યાસ (જો હોય તો)">
                <input
                  type="text"
                  className="form-control"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Graduate / B.Com"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          )}

          {/* 5. If Business: Ask Business Details & Workplace Address! */}
          {occupationType === "Business (વેપાર / બિઝનેસ)" && (
            <>
              <div className="form-row">
                <FormField 
                  label="Business Name / Nature of Business" 
                  gujaratiLabel="વેપાર / બિઝનેસની વિગત"
                  required
                  helpText="દુકાન, પેઢી કે વ્યવસાયનું નામ/પ્રકાર"
                >
                  <input
                    type="text"
                    className="form-control"
                    value={occupationDetail}
                    onChange={(e) => setOccupationDetail(e.target.value)}
                    placeholder="e.g. ટેક્સટાઇલ / કરિયાણાની દુકાન / કન્સ્ટ્રક્શન / હાર્ડવેર"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField 
                  label="Shop / Workplace Address" 
                  gujaratiLabel="દુકાન / પેઢી / વ્યવસાયનું સરનામું"
                  helpText="દુકાન કે ઓફિસ ક્યાં આવેલી છે તે સરનામું"
                >
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

              <div className="form-row">
                <FormField label="Education" gujaratiLabel="અભ્યાસ">
                  <input
                    type="text"
                    className="form-control"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Com / MBA / Graduate"
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>
            </>
          )}

          {/* 6. If Job / Service: Ask Job Title/Company & Workplace Address! */}
          {occupationType === "Job / Service (નોકરી / સર્વિસ)" && (
            <>
              <div className="form-row">
                <FormField 
                  label="Job Title / Company Name" 
                  gujaratiLabel="નોકરી / કંપની / હોદ્દો"
                  required
                  helpText="કઈ કંપનીમાં અથવા કયા હોદ્દા પર નોકરી કરે છે"
                >
                  <input
                    type="text"
                    className="form-control"
                    value={occupationDetail}
                    onChange={(e) => setOccupationDetail(e.target.value)}
                    placeholder="e.g. સોફ્ટવેર એન્જિનિયર / બેંક મેનેજર / સરકારી શિક્ષક / એકાઉન્ટન્ટ"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField 
                  label="Company / Office Address" 
                  gujaratiLabel="ઓફિસ / કંપનીનું સરનામું"
                  helpText="નોકરીનું સ્થળ કે શહેર"
                >
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

              <div className="form-row">
                <FormField label="Education" gujaratiLabel="અભ્યાસ">
                  <input
                    type="text"
                    className="form-control"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech / M.Sc. / B.Com"
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>
            </>
          )}

          {/* 7. If Other */}
          {occupationType === "Other (અન્ય)" && (
            <>
              <div className="form-row">
                <FormField label="Occupation Details" gujaratiLabel="વ્યવસાયની વિગત" required>
                  <input
                    type="text"
                    className="form-control"
                    value={occupationDetail}
                    onChange={(e) => setOccupationDetail(e.target.value)}
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
                    placeholder="સ્થળ કે સરનામું"
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
                    placeholder="e.g. Graduate"
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>
            </>
          )}
        </div>

        <div className="form-row">
          <FormField label="Maternal Family Surname" gujaratiLabel="મોસાળની અટક">
            <input
              type="text"
              className="form-control"
              value={maternalSurname}
              onChange={(e) => setMaternalSurname(e.target.value)}
              placeholder="e.g. દેસાઈ / મહેતા / સોલંકી"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Maternal Family Village" gujaratiLabel="મોસાળનું ગામ">
            <input
              type="text"
              className="form-control"
              value={maternalVillage}
              onChange={(e) => setMaternalVillage(e.target.value)}
              placeholder="e.g. ઉનાવા / વાંકાનેર / માણસા"
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        <FormField label="Complete Residential Address" gujaratiLabel="ઘરનું પૂરું સરનામું">
          <textarea
            className="form-control"
            rows={2}
            value={residentialAddress}
            onChange={(e) => setResidentialAddress(e.target.value)}
            placeholder="Residential address"
            disabled={isSubmitting}
          />
        </FormField>

        <div className="privacy-checkboxes">
          {isHead && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPublicMobile}
                onChange={(e) => setIsPublicMobile(e.target.checked)}
              />
              <span>Show Mobile Number publicly (સાર્વજનિક મોબાઈલ દર્શાવવો)</span>
            </label>
          )}
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

      <div className="form-actions">
        {!isEdit && (
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={(e) => handleFormSubmit(e, true)}
            disabled={isSubmitting}
          >
            + Save & Add Another (સાચવો અને બીજો ઉમેરો)
          </button>
        )}
        <button
          type="button"
          onClick={(e) => handleFormSubmit(e, false)}
          className="btn btn-primary btn-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : isEdit ? "Update Member Profile" : "Save Member (સભ્ય સાચવો)"}
        </button>
      </div>
    </form>
  );
}
