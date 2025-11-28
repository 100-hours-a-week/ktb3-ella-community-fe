import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaUser } from "react-icons/fa6";

import { useAuthStore } from "@/shared/stores/use-auth-store";
import { useImageUpload } from "@/shared/hooks/use-image-upload.js";
import { validateNickname } from "@/shared/utils/validation";
import {
  checkAvailability,
  updateUserProfile,
  deleteCurrentUser,
} from "@/features/users/api/user-api";

import Input from "@/components/common/input";
import Button from "@/components/common/button";
import Modal from "@/components/common/modal";
import ProfileImageUploader from "@/components/common/profile-image-uploader";
import { fetchMe } from "@/features/users/api/user-api";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [nickname, setNickname] = useState("");
  const [errors, setErrors] = useState({ nickname: "" });
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 이미지 업로드 훅 초기화
  const { previewUrl, handleFileChange, upload } = useImageUpload(
    user?.profileImageUrl || ""
  );

  // 초기 데이터 세팅
  useEffect(() => {
    const ensureUser = async () => {
      if (!user) {
        try {
          await fetchMe();
        } catch (e) {
          // 유저 정보를 못 불러오면 로그인 화면으로 보낸다.
          navigate("/login");
        }
      }
    };

    ensureUser();

    if (user) setNickname(user.nickname || "");
  }, [user, fetchMe, navigate]);

  // --- 핸들러 ---

  // 닉네임 변경
  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
    setErrors((prev) => ({ ...prev, nickname: "" })); // 입력 중엔 에러 초기화
  };

  // 닉네임 포커스 아웃 시 검증 (유효성 + 중복 체크)
  const handleNicknameBlur = async () => {
    const trimmed = nickname.trim();

    // 1. 기본 유효성 검사
    const basicError = validateNickname(trimmed);
    if (basicError) {
      setErrors((prev) => ({ ...prev, nickname: basicError }));
      return false;
    }

    // 2. 기존 닉네임과 같으면 중복 체크 스킵
    if (trimmed === user.nickname) {
      return true;
    }

    // 3. 중복 체크
    setIsCheckingNickname(true);
    try {
      const { nicknameAvailable } = await checkAvailability({
        nickname: trimmed,
      });
      if (!nicknameAvailable) {
        setErrors((prev) => ({ ...prev, nickname: "*중복된 닉네임입니다." }));
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await handleNicknameBlur();
    if (!isValid) return;

    try {
      const uploadedUrl = await upload();

      await updateUserProfile({
        nickname: nickname.trim(),
        profileImageUrl: uploadedUrl,
      });

      // 스토어 정보 갱신
      await fetchMe();

      // 토스트 메시지
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      alert(error.message || "회원정보 수정 실패");
    }
  };

  // 회원 탈퇴
  const handleWithdraw = async () => {
    try {
      await deleteCurrentUser();
      logout();
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/login");
    } catch (error) {
      alert("회원 탈퇴 실패: " + error.message);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="auth-lg">
      <div className="auth">
        <h1 className="auth-title">회원정보 수정</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* 프로필 이미지 */}
          <div className="field">
            <div
              className="field-label-wrapper"
              style={{ marginBottom: "8px" }}
            >
              <FaUser size={20} color="#2563EB" />
              <label className="field-label">프로필 사진*</label>
            </div>
            <ProfileImageUploader
              previewUrl={previewUrl}
              onChange={handleFileChange}
              error={""}
            />
          </div>

          {/* 이메일 */}
          <div className="field">
            <div className="field-label-wrapper">
              <FaEnvelope size={20} color="#2563EB" />
              <label className="field-label">이메일*</label>
            </div>
            <p
              className="field_value"
              id="email-value"
              style={{ padding: "10px 4px" }}
            >
              {user.email}
            </p>
          </div>

          {/* 닉네임 입력 */}
          <Input
            label="닉네임*"
            name="nickname"
            Icon={FaUser}
            placeholder="닉네임을 입력해주세요"
            value={nickname}
            onChange={handleNicknameChange}
            onBlur={handleNicknameBlur}
            error={errors.nickname}
          />

          <Button
            type="submit"
            disabled={
              !!errors.nickname || isCheckingNickname || !nickname.trim()
            }
          >
            수정하기
          </Button>
        </form>

        <button
          type="button"
          className="link-withdraw"
          style={{
            marginTop: "20px",
            background: "none",
            border: "none",
            color: "#666",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          회원탈퇴
        </button>
      </div>

      {/* 회원탈퇴 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleWithdraw}
        title="회원 탈퇴하시겠습니까?"
        description="작성된 게시글과 댓글은 삭제됩니다."
      />

      {/* 토스트 메시지 */}
      <div className={`toast ${showToast ? "show" : ""}`}>수정 완료</div>
    </div>
  );
};

export default ProfileEdit;
