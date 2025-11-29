import React from "react";
import { MdCameraAlt, MdPerson } from "react-icons/md";

const ProfileImageUploader = ({ previewUrl, onChange, error }) => {
  return (
    <div
      className="profile-uploader-container"
      style={{ textAlign: "center", marginBottom: "20px" }}
    >
      <div
        className="profile-image-wrapper"
        style={{
          position: "relative",
          width: "100px",
          height: "100px",
          margin: "0 auto",
          cursor: "pointer",
        }}
      >
        <input
          type="file"
          accept="image/*"
          id="profile-img-input"
          onChange={onChange}
          style={{ display: "none" }}
        />

        <label
          htmlFor="profile-img-input"
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="프로필 미리보기"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #ddd",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MdPerson size={60} color="#ccc" />
            </div>
          )}

          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "#2563EB",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid white",
            }}
          >
            <MdCameraAlt size={18} color="white" />
          </div>
        </label>
      </div>
      {error && (
        <p
          className="error-text"
          style={{ fontSize: "12px", color: "red", marginTop: "8px" }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default ProfileImageUploader;
