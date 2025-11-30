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

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    if (errors.nickname) {
      setErrors((prev) => ({ ...prev, nickname: "" }));
    }
  };

  /**
   * 닉네임 유효성 및 중복 검사 통합 함수
   */
  const validateAndCheckAvailability = async (targetNickname) => {
    const trimmed = targetNickname.trim();

    const basicError = validateNickname(trimmed);
    if (basicError) return basicError;

    if (trimmed === user.nickname) return null;

    try {
      setIsCheckingNickname(true);
      const { nicknameAvailable } = await checkAvailability({
        nickname: trimmed,
      });
      
      if (!nicknameAvailable) {
        return "*이미 사용중인 닉네임입니다.";
      }
      return null; // 사용 가능
    } catch (error) {
      console.error(error);
      return "중복 확인 중 오류가 발생했습니다.";
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // 포커스가 벗어날 때 검사 수행
  const handleNicknameBlur = async () => {
    // 값이 비어있거나 변경사항이 없으면 검사하지 않음 (선택적 최적화)
    if (!nickname.trim()) return; 

    const errorMsg = await validateAndCheckAvailability(nickname);
    setErrors((prev) => ({ ...prev, nickname: errorMsg || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // 제출 직전에 한 번 더 검증
    const errorMsg = await validateAndCheckAvailability(nickname);
    
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, nickname: errorMsg }));
      return;
    }

    updateProfileMutation.mutate();
  };

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
            <div className="field-label-wrapper" style={{ marginBottom: "8px" }}>
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
            <p className="field_value" id="email-value" style={{ padding: "10px 4px" }}>
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
              !!errors.nickname ||      // 에러가 있거나
              isCheckingNickname ||     // 중복 확인 중이거나
              !nickname.trim() ||       // 닉네임이 비었거나
              updateProfileMutation.isPending // 저장 중일 때
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleWithdraw}
        title="회원 탈퇴하시겠습니까?"
        description="작성된 게시글과 댓글은 삭제됩니다."
      />

      <Toast open={isToastOpen} message="수정 완료" />
    </div>
  );
};

export default ProfileEdit;