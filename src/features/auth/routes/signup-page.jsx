import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import "@/styles/global.css";
import "@/styles/pages/signup.css";

import {
  MdEmail,
  MdLockOutline,
  MdPerson,
  MdCheckCircle,
  MdLogin,
} from "react-icons/md";

import Input from "@/shared/components/common/input.jsx";
import Button from "@/shared/components/common/button.jsx";
import {
  validateEmail,
  validatePassword,
  validateNickname,
} from "@/shared/utils/validation";

import { fetchMe, checkAvailability } from "@/features/users/api/user-api";
import { requestSignup } from "@/features/auth/api/auth-api.js";
import { useAuthStore } from "@/shared/stores/use-auth-store";

import { useImageUpload } from "@/shared/hooks/use-image-upload.js";
import ProfileImageUploader from "@/shared/components/common/profile-image-uploader.jsx";

const SignUpPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { previewUrl, handleFileChange, upload } = useImageUpload();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });

  const [errors, setErrors] = useState({});

  const signupMutation = useMutation({
    mutationFn: async (inputData) => {
      // 이미지 업로드
      const uploadedProfileUrl = await upload();

      // 회원가입 요청
      const { accessToken } = await requestSignup({
        email: inputData.email.trim(),
        password: inputData.password.trim(),
        nickname: inputData.nickname.trim(),
        profileImageUrl: uploadedProfileUrl,
      });

      const userData = await fetchMe(accessToken);

      login(userData, accessToken);
      return true;
    },

    onSuccess: () => {
      navigate("/posts");
    },

    onError: (error) => {
      console.error(error);
      if (error.code === "INVALID_INPUT_VALUE") {
        setErrors((prev) => ({
          ...prev,
          password: "입력값을 다시 확인해주세요.",
        }));
      } else {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    },
  });

  const handleProfileChange = (e) => {
    handleFileChange(e);

    setErrors((prev) => ({ ...prev, profile: "" }));
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 포커스 해제 시 유효성 검사 & 중복 체크
  const handleBlur = async (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    // 로컬 유효성 검사
    if (name === "email") {
      errorMessage = validateEmail(value);
    } else if (name === "password") {
      errorMessage = validatePassword(value);
    } else if (name === "passwordConfirm") {
      if (value !== formData.password)
        errorMessage = "*비밀번호가 일치하지 않습니다.";
    } else if (name === "nickname") {
      errorMessage = validateNickname(value);
    }

    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
    if (errorMessage) return;

    // 서버 중복 확인 (이메일 & 닉네임)
    if (name === "email" || name === "nickname") {
      try {
        const availData = await checkAvailability({ [name]: value });

        const isAvailable =
          name === "email"
            ? availData.emailAvailable
            : availData.nicknameAvailable;

        if (!isAvailable) {
          setErrors((prev) => ({
            ...prev,
            [name]: `이미 사용 중인 ${
              name === "email" ? "이메일" : "닉네임"
            }입니다.`,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const isButtonActive =
    formData.email &&
    formData.password &&
    formData.passwordConfirm &&
    formData.nickname &&
    Object.values(errors).every((err) => !err);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!previewUrl) {
      setErrors((prev) => ({ ...prev, profile: "*프로필 사진 필수" }));
      return;
    }

    if (!isButtonActive) return;

    signupMutation.mutate(formData);
  };

  return (
    <div className="page-login">
      <div className="auth-lg">
        <div className="auth">
          <h1>회원가입</h1>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <div
                className="profile-upload-wrapper"
                style={{
                  position: "relative",
                  width: "100px",
                  height: "100px",
                  cursor: "pointer",
                }}
              >
                <ProfileImageUploader
                  previewUrl={previewUrl}
                  onChange={handleProfileChange}
                  error={errors.profile}
                />
              </div>
            </div>

            <Input
              label="이메일"
              Icon={MdEmail}
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
            />

            <Input
              label="닉네임"
              Icon={MdPerson}
              name="nickname"
              placeholder="별명 (10자 이내)"
              value={formData.nickname}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nickname}
            />

            <Input
              label="비밀번호"
              Icon={MdLockOutline}
              name="password"
              type="password"
              placeholder="비밀번호 입력"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
            />

            <Input
              label="비밀번호 확인"
              Icon={MdCheckCircle}
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호 재입력"
              value={formData.passwordConfirm}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.passwordConfirm}
            />

            <Button
              type="submit"
              disabled={!isButtonActive || signupMutation.isPending}
              className="btn-login"
              Icon={MdLogin}
            >
              회원가입
            </Button>
          </form>

          <p style={{ marginTop: "20px", textAlign: "center" }}>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
