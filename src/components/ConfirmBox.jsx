import React from "react";
import "../styles/components/ConfirmBox.css";

const ConfirmBox = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-overlay-custom">
      <div className="confirm-box-custom">
        <p className="confirm-message-custom">{message}</p>
        <div className="confirm-actions-custom">
          <button
            className="confirm-btn-custom confirm-yes-custom"
            onClick={onConfirm}
          >
            Có
          </button>
          <button
            className="confirm-btn-custom confirm-no-custom"
            onClick={onCancel}
          >
            Không
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
