import React, { useState, useEffect } from "react";
import { FormField } from "../components/FormField";
import { uploadMemberPhoto } from "../services/storageService";
import { calculateAge } from "../utils/calculateAge";
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  Plus, 
  Trash2, 
  User, 
  Calendar, 
  Briefcase,
  ChevronDown,
  ChevronUp
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
  const [occupation, setOccupation] = useState("");
  const [workplaceAddress, setWorkplaceAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [maternalSurname, setMaternalSurname] = useState("");
  const [maternalVillage, setMaternalVillage] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [isPublicMobile, setIsPublicMobile] = useState(true);
  const [isPublicAddress, setIsPublicAddress] = useState(true);

  // List of additional members to add with this family
  const [additionalMembers, setAdditionalMembers] = useState([]);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Current new member form fields
  const [memFullName, setMemFullName] = useState("");
  const [memRelation, setMemRelation] = useState("પુત્ર (Son)");
  const [memCustomRelation, setMemCustomRelation] = useState("");
  const [memDob, setMemDob] = useState("");
  const [memEducation, setMemEducation] = useState("");
  const [memOccupation, setMemOccupation] = useState("");
  const [memWorkplace, setMemWorkplace] = useState("");
  const [memMobile, setMemMobile] = useState("");
  const [memMaternalSurname, setMemMaternalSurname] = useState("");
  const [memMaternalVillage, setMemMaternalVillage] = useState("");
  const [memAddress, setMemAddress] = useState("");
  const [memPublicMobile, setMemPublicMobile] = useState(true);
  const [memPublicAddress, setMemPublicAddress] = useState(true);
  const [memError, setMemError] = useState("");

  // Errors & UI state
  const [errors, setErrors] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (initialData) {
      setHeadFullName(initialData.headFullName || "");
      setOriginalVillage(initialData.originalVillage || "");
      setMatajiMadhSthal(initialData.matajiMadhSthal || "");
    }
    if (initialHeadData) {
      setDateOfBirth(initialHeadData.dateOfBirth || "");
      setEducation(initialHeadData.education || "");
      setOccupation(initialHeadData.occupation || "");
      setWorkplaceAddress(initialHeadData.workplaceAddress || "");
      setMobileNumber(initialHeadData.mobileNumber || "");
      setMaternalSurname(initialHeadData.maternalSurname || "");
      setMaternalVillage(initialHeadData.maternalVillage || "");
      setResidentialAddress(initialHeadData.residentialAddress || "");
      setPhotoUrl(initialHeadData.photoUrl || "");
      setPhotoPreview(initialHeadData.photoUrl || "");
      setIsPublicMobile(initialHeadData.isPublicMobile !== false);
      setIsPublicAddress(initialHeadData.isPublicAddress !== false);
      setShowHeadDetails(true);
    }
  }, [initialData, initialHeadData]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

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
    if (mobileNumber && !/^[0-9+ \-]{8,15}$/.test(mobileNumber.trim())) {
      errs.mobileNumber = "Please enter a valid mobile number.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
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

    const newMemberItem = {
      tempId: "tmp-" + Date.now() + Math.random(),
      fullName: memFullName.trim(),
      relationshipToHead: relation,
      dateOfBirth: memDob,
      education: memEducation.trim(),
      occupation: memOccupation.trim(),
      workplaceAddress: memWorkplace.trim(),
      mobileNumber: memMobile.trim(),
      maternalSurname: memMaternalSurname.trim() || maternalSurname.trim(),
      maternalVillage: memMaternalVillage.trim() || maternalVillage.trim(),
      residentialAddress: memAddress.trim() || residentialAddress.trim(),
      isPublicMobile: memPublicMobile,
      isPublicAddress: memPublicAddress,
      photoUrl: ""
    };

    setAdditionalMembers(prev => [...prev, newMemberItem]);

    // Reset member fields for next member
    setMemFullName("");
    setMemRelation("પુત્ર (Son)");
    setMemCustomRelation("");
    setMemDob("");
    setMemEducation("");
    setMemOccupation("");
    setMemWorkplace("");
    setMemMobile("");
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

    let finalPhotoUrl = photoUrl;
    if (photoFile) {
      setUploadingPhoto(true);
      try {
        finalPhotoUrl = await uploadMemberPhoto(photoFile, 'head');
      } catch (err) {
        setErrors(prev => ({ ...prev, photo: err.message || "Failed to upload photo" }));
        setUploadingPhoto(false);
        return;
      }
      setUploadingPhoto(false);
    }

    const familyPayload = {
      headFullName: headFullName.trim(),
      originalVillage: originalVillage.trim(),
      matajiMadhSthal: matajiMadhSthal.trim(),
      headMemberId: initialData?.headMemberId
    };

    const headPayload = {
      dateOfBirth,
      education: education.trim(),
      occupation: occupation.trim(),
      workplaceAddress: workplaceAddress.trim(),
      mobileNumber: mobileNumber.trim(),
      maternalSurname: maternalSurname.trim(),
      maternalVillage: maternalVillage.trim(),
      residentialAddress: residentialAddress.trim(),
      photoUrl: finalPhotoUrl,
      isPublicMobile,
      isPublicAddress
    };

    // CRITICAL FIX: If the user typed a member in the form fields, automatically include it!
    let finalMembers = [...additionalMembers];
    if (memFullName.trim()) {
      const relation = memRelation === "Other (અન્ય સંબંધ લખો)"
        ? (memCustomRelation.trim() || "અન્ય")
        : memRelation;

      finalMembers.push({
        tempId: "tmp-" + Date.now(),
        fullName: memFullName.trim(),
        relationshipToHead: relation,
        dateOfBirth: memDob,
        education: memEducation.trim(),
        occupation: memOccupation.trim(),
        workplaceAddress: memWorkplace.trim(),
        mobileNumber: memMobile.trim(),
        maternalSurname: memMaternalSurname.trim() || maternalSurname.trim(),
        maternalVillage: memMaternalVillage.trim() || maternalVillage.trim(),
        residentialAddress: memAddress.trim() || residentialAddress.trim(),
        isPublicMobile: memPublicMobile,
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
        <p className="form-section-desc">
          Enter the family head's name, original village, and Mataji Madh location.
        </p>

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
              <p className="form-section-desc">
                Fill in additional personal details now, or edit them anytime later.
              </p>
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

                <FormField label="Occupation / Business" gujaratiLabel="વ્યવસાય / નોકરી">
                  <input
                    type="text"
                    className="form-control"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. વેપાર, ખેતી, નોકરી..."
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>

              <FormField label="Workplace / Business Address" gujaratiLabel="વ્યવસાયનું સરનામું">
                <input
                  type="text"
                  className="form-control"
                  value={workplaceAddress}
                  onChange={(e) => setWorkplaceAddress(e.target.value)}
                  placeholder="Office / Shop / Factory address"
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

              <div className="form-row photo-upload-row">
                <div className="photo-preview-container">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="photo-preview-img" />
                  ) : (
                    <div className="photo-placeholder-box">No Photo</div>
                  )}
                </div>

                <div className="photo-input-group">
                  <label className="btn btn-secondary file-upload-btn">
                    <Upload size={16} />
                    <span>Upload Head Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      style={{ display: "none" }}
                      disabled={isSubmitting || uploadingPhoto}
                    />
                  </label>
                  <span className="file-info-text">PNG, JPG, WebP up to 5MB</span>
                  {errors.photo && <span className="field-error-message">{errors.photo}</span>}
                </div>
              </div>

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
              <p className="form-section-desc">
                Add sons, daughters, spouse, or other relatives right here without leaving this page.
              </p>
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
                    onChange={(e) => setMemRelation(e.target.value)}
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
                <FormField label="Date of Birth" gujaratiLabel="જન્મ તારીખ">
                  <input
                    type="date"
                    className="form-control"
                    value={memDob}
                    onChange={(e) => setMemDob(e.target.value)}
                  />
                </FormField>

                <FormField label="Mobile Number" gujaratiLabel="મોબાઈલ નંબર">
                  <input
                    type="tel"
                    className="form-control"
                    value={memMobile}
                    onChange={(e) => setMemMobile(e.target.value)}
                    placeholder="+91 94080 12345"
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
                    placeholder="e.g. B.Tech / ધોરણ 10 / M.Sc."
                  />
                </FormField>

                <FormField label="Occupation / Student" gujaratiLabel="વ્યવસાય / વિદ્યાર્થી">
                  <input
                    type="text"
                    className="form-control"
                    value={memOccupation}
                    onChange={(e) => setMemOccupation(e.target.value)}
                    placeholder="e.g. સોફ્ટવેર એન્જિનિયર / વિદ્યાર્થી"
                  />
                </FormField>
              </div>

              <div className="form-row">
                <FormField label="Workplace Address" gujaratiLabel="વ્યવસાયનું સરનામું">
                  <input
                    type="text"
                    className="form-control"
                    value={memWorkplace}
                    onChange={(e) => setMemWorkplace(e.target.value)}
                    placeholder="Workplace or company address"
                  />
                </FormField>

                <FormField label="Maternal Village" gujaratiLabel="મોસાળનું ગામ">
                  <input
                    type="text"
                    className="form-control"
                    value={memMaternalVillage}
                    onChange={(e) => setMemMaternalVillage(e.target.value)}
                    placeholder={maternalVillage ? `Default: ${maternalVillage}` : "e.g. ઉનાવા"}
                  />
                </FormField>
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
          disabled={isSubmitting || uploadingPhoto}
        >
          {isSubmitting || uploadingPhoto 
            ? "Saving Complete Record..." 
            : isEdit 
              ? "Update Kutumb" 
              : `Save Kutumb with ${1 + additionalMembers.length + (memFullName.trim() ? 1 : 0)} Members (કુટુંબ સાચવો)`}
        </button>
      </div>
    </form>
  );
}
