import React, { useState, useEffect } from "react";
import { FormField } from "../components/FormField";
import { uploadMemberPhoto } from "../services/storageService";
import { calculateAge } from "../utils/calculateAge";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

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

    onSubmit(familyPayload, headPayload);
  };

  const calculatedAge = calculateAge(dateOfBirth);

  return (
    <form onSubmit={handleSubmit} className="standard-form">
      <div className="form-card">
        <h3 className="form-section-title">
          {isEdit ? "Edit Kutumb (કુટુંબ સુધારો)" : "Family Information (કુટુંબની પ્રાથમિક વિગતો)"}
        </h3>
        <p className="form-section-desc">
          Enter the family head's identity and ancestral roots.
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

      {!isEdit && (
        <div className="form-card">
          <div className="toggle-section-header">
            <div>
              <h3 className="form-section-title">Family Head's Personal Details (વૈકલ્પિક અંગત વિગતો)</h3>
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

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isSubmitting || uploadingPhoto}
        >
          {isSubmitting || uploadingPhoto ? "Saving..." : isEdit ? "Update Kutumb" : "Create Kutumb & Register Head"}
        </button>
      </div>
    </form>
  );
}
