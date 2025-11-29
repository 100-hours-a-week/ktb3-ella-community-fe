import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaUser } from "react-icons/fa6";
import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "@/shared/stores/use-auth-store";
import { useImageUpload } from "@/shared/hooks/use-image-upload.js";
import { validateNickname } from "@/shared/utils/validation";

import {
  checkAvailability,
  updateUserProfile,
  deleteCurrentUser,
} from "@/features/users/api/user-api";
import { useTransientToast } from "@/shared/hooks/use-transient-toast.js";

import Input from "@/shared/components/common/input";
import Button from "@/shared/components/common/button";
import Modal from "@/shared/components/common/modal";
import ProfileImageUploader from "@/shared/components/common/profile-image-uploader";
import Toast from "@/shared/components/common/toast";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();

  const [nickname, setNickname] = useState(user?.nickname || "");
  const [errors, setErrors] = useState({ nickname: "" });
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lastCheckedNickname, setLastCheckedNickname] = useState(
    user?.nickname || ""
  );
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(true);
  const { isVisible: isToastOpen, show: showToast } = useTransientToast();

  const { previewUrl, handleFileChange, upload } = useImageUpload(
    user?.profileImageUrl || ""
  );

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const uploadedUrl = await upload();

      const newUserData = {
        nickname: nickname.trim(),
        profileImageUrl: uploadedUrl || user.profileImageUrl,
      };
      await updateUserProfile(newUserData);

      return newUserData;
    },
    onSuccess: (newUserData) => {
      updateUser({ ...user, ...newUserData });

      showToast("수정 완료");
    },
    onError: (error) => {
      console.error(error);
      alert("회원정보 수정에 실패했습니다. 다시 시도해주세요.");
    },
  });

  // 회원 탈퇴
  const deleteUserMutation = useMutation({
    mutationFn: deleteCurrentUser,
    onSuccess: () => {
      logout();
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/login");
    },
    onError: () => {
      alert("회원 탈퇴 실패. 다시 시도해주세요.");
      setIsDeleteModalOpen(false);
    },
  });

  // 닉네임 변경
  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
    setErrors((prev) => ({ ...prev, nickname: "" }));
  };

  const handleNicknameBlur = async () => {
    const trimmed = nickname.trim();

    const basicError = validateNickname(trimmed);
    if (basicError) {
      setErrors((prev) => ({ ...prev, nickname: basicError }));
      return false;
    }

    if (trimmed === user.nickname) {
      setLastCheckedNickname(trimmed);
      setIsNicknameAvailable(true);
      return true;
    }

    if (trimmed === lastCheckedNickname) {
      if (!isNicknameAvailable) {
        setErrors((prev) => ({
          ...prev,
          nickname: "*이미 사용중인 닉네임입니다.",
        }));
      }
      return isNicknameAvailable;
    }

    setIsCheckingNickname(true);
    try {
      const { nicknameAvailable } = await checkAvailability({
        nickname: trimmed,
      });
      setLastCheckedNickname(trimmed);
      setIsNicknameAvailable(nicknameAvailable);

      if (!nicknameAvailable) {
        setErrors((prev) => ({
          ...prev,
          nickname: "*이미 사용중인 닉네임입니다.",
        }));
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
    if (!user) return null;
    e.preventDefault();

    const isValid = await handleNicknameBlur();
    if (!isValid) return;

    updateProfileMutation.mutate();
  };

  // 회원 탈퇴
  const handleWithdraw = () => {
    deleteUserMutation.mutate();
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

          {/* 닉네임 */}
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
              !!errors.nickname ||
              isCheckingNickname ||
              !nickname.trim() ||
              updateProfileMutation.isPending
            }
          >
            {updateProfileMutation.isPending ? "수정 중..." : "수정하기"}
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
      <Toast open={isToastOpen} message="수정 완료" />
    </div>
  );
};

export default ProfileEdit;
