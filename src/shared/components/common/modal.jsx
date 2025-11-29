import React, { useEffect } from "react";

import "@/styles/global.css";

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "",
  description = "",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // 배경 클릭 시 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop active" onClick={handleBackdropClick}>
      <div className="modal">
        <p className="modal-message">{title}</p>
        <p className="modal-sub-message">{description}</p>
        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>
            취소
          </button>
          <button type="button" className="modal-confirm" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
