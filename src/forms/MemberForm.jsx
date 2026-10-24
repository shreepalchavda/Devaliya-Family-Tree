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

export function MemberForm({ 
  initialData = null, 
  familyHeadName = "", 
  onSubmit, 
  isSubmitting = false,
  isEdit = false 
}) {
  const [fullName, setFullName] = useState("");
  const [relationshipType, setRelationshipType] = useState("પુત્ર (Son)");
  const [customRelationship, setCustomRelationship] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");
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
      if (foundInCommon) {
        setRelationshipType(foundInCommon);
      } else if (initialData.relationshipToHead) {
        setRelationshipType("Other (અન્ય સંબંધ લખો)");
        setCustomRelationship(initialData.relationshipToHead);
      }

      setDateOfBirth(initialData.dateOfBirth || "");
      setEducation(initialData.education || "");
      setOccupation(initialData.occupation || "");
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

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = "Member full name is required (સભ્યનું પૂરું નામ જરૂરી છે).";
    }
    if (relationshipType === "Other (અન્ય સંબંધ લખો)" && !customRelationship.trim()) {
      errs.relationship = "Please specify the relationship with the family head.";
    }
    if (mobileNumber && !/^[0-9+ \-]{8,15}$/.test(mobileNumber.trim())) {
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

    const payload = {
      fullName: fullName.trim(),
      relationshipToHead,
      dateOfBirth,
      education: education.trim(),
      occupation: occupation.trim(),
      workplaceAddress: workplaceAddress.trim(),
      mobileNumber: mobileNumber.trim(),
      maternalSurname: maternalSurname.trim(),
      maternalVillage: maternalVillage.trim(),
      residentialAddress: residentialAddress.trim(),
      isPublicMobile,
      isPublicAddress
    };

    onSubmit(payload, isAddAnother);

    if (isAddAnother) {
      // Clear fields for the next member
      setFullName("");
      setRelationshipType("પુત્ર (Son)");
      setCustomRelationship("");
      setDateOfBirth("");
      setEducation("");
      setOccupation("");
      setWorkplaceAddress("");
      setMobileNumber("");
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
              onChange={(e) => setRelationshipType(e.target.value)}
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

          <FormField 
            label="Mobile Number" 
            gujaratiLabel="મોબાઈલ નંબર"
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

        <div className="form-row">
          <FormField 
            label="Education / Studies" 
            gujaratiLabel="અભ્યાસ"
            helpText="School, standard, college degree, or current study"
          >
            <input
              type="text"
              className="form-control"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. B.Tech / ધોરણ 10 / M.Sc. / B.Com"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField 
            label="Occupation / Employment / Student" 
            gujaratiLabel="વ્યવસાય / નોકરી / વિદ્યાર્થી"
            helpText="Job title, business, farming, student, or homemaker"
          >
            <input
              type="text"
              className="form-control"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Software Engineer / વેપાર / ખેતી / વિદ્યાર્થી"
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        <FormField 
          label="Workplace / Business Address" 
          gujaratiLabel="વ્યવસાયનું સરનામું"
          helpText="Optional: Leave blank for students, homemakers, or non-working members"
        >
          <input
            type="text"
            className="form-control"
            value={workplaceAddress}
            onChange={(e) => setWorkplaceAddress(e.target.value)}
            placeholder="Office, shop, or firm location"
            disabled={isSubmitting}
          />
        </FormField>

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
