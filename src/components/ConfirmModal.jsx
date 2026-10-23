import React from "react";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  isDanger = true,
  isLoading = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-row">
            {isDanger && <AlertTriangle className="modal-danger-icon" size={22} />}
            <h3>{title}</h3>
          </div>
          <button onClick={onCancel} className="modal-close-btn" disabled={isLoading}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn btn-secondary" 
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`} 
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
