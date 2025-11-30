import React from "react";
import { MdCameraAlt, MdPerson } from "react-icons/md";
import "@/styles/components/profile-image-uploader.css";

const ProfileImageUploader = ({ previewUrl, onChange, error }) => {
  return (
    <div className="profile-uploader-container">
      <div className="profile-image-wrapper">
        <input
          type="file"
          accept="image/*"
          id="profile-img-input"
          onChange={onChange}
          className="profile-img-input"
        />

        <label htmlFor="profile-img-input" className="profile-image-label">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="프로필 미리보기"
              className="profile-image-preview"
            />
          ) : (
            <div className="profile-image-placeholder">
              <MdPerson size={60} color="#ccc" />
            </div>
          )}

          <div className="profile-image-camera">
            <MdCameraAlt size={18} color="white" />
          </div>
        </label>
      </div>
      {error && (
        <p className="error-text profile-uploader-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default ProfileImageUploader;
