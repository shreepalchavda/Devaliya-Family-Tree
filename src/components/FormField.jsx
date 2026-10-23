import React from "react";

export function FormField({ 
  label, 
  gujaratiLabel, 
  required, 
  error, 
  children, 
  helpText 
}) {
  return (
    <div className={`form-field-group ${error ? 'has-error' : ''}`}>
      <label className="form-label">
        <span className="label-text">
          {label}
          {gujaratiLabel && <span className="gujarati-sublabel"> ({gujaratiLabel})</span>}
        </span>
        {required && <span className="required-star">*</span>}
      </label>
      
      {children}

      {helpText && !error && (
        <span className="field-help-text">{helpText}</span>
      )}

      {error && (
        <span className="field-error-message">{error}</span>
      )}
    </div>
  );
}
