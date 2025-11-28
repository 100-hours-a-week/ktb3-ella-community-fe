import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/styles/global.css";
import "@/styles/header.css";
import "@/styles/pages/login.css";

import { validateEmail, validatePassword } from "@/utils/validation";

import { saveStoredUser } from "@/features/users/stores/user.js";
import {
  fetchMe,
  requestLogin,
  setAccessToken,
} from "@/features/auth/api/api.js";
import { MdEmail, MdLockOutline, MdLogin } from "react-icons/md";
import Input from "@/components/common/input.jsx";
import Button from "@/components/common/button.jsx";

/**
 * useState를 사용하여 사용자가 입력한 이메일과 비밀번호를 실시간으로 저장
 * -> 화면에 사용자가 입력한 값을 실시간으로 반영
 * formData : 현재 입력된 값들을 담고 있는 객체
 * setFormData : formData 객체를 업데이트하는 함수
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "", // 초기값: 빈 문자열
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  /**
   * 입력값 변경 핸들러
   * input 태그에 글자를 입력할 때마다 실행되는 함수
   * 하나의 함수로 이메일과 비밀번호 두 개의 입력을 모두 처리
   */
  const handleChange = (e) => {
    // name 속성은 어떤 input인지 구분하는 용도 - email 또는 password
    // value 속성은 사용자가 입력한 실제 값
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev, // 기존의 formData 내용을 복사
      [name]: value, //{ email: value } 또는 { password: value } 형태로 업데이트
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    if (name === "email") {
      errorMessage = validateEmail(value);
    } else if (name === "password") {
      errorMessage = validatePassword(value);
    }

    // 에러 상태 업데이트
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const isButtonActive =
    !validateEmail(formData.email) && !validatePassword(formData.password);

  /**
   * 폼 제출 핸들러
   * 로그인 버튼을 누르거나 엔터를 눌렀을 때 실행되는 함수
   */
  const handleSubmit = async (e) => {
    //` 폼 제출 기본 동작 방지 (페이지 새로고침 방지)
    e.preventDefault();

    // 제출 전 마지막 유효성 검사
    const emailMsg = validateEmail(formData.email);
    const passwordMsg = validatePassword(formData.password);

    if (emailMsg || passwordMsg) {
      setErrors({ email: emailMsg, password: passwordMsg });
      return;
    }

    try {
      // 로그인 API 요청
      const { accessToken } = await requestLogin({
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      // 토큰 저장 및 유저 정보 조회
      setAccessToken(accessToken);
      const userData = await fetchMe();
      saveStoredUser(userData);

      // 페이지 이동
      navigate("/posts");
    } catch (error) {
      console.error(error);

      if (error.code === "USER_NOT_FOUND") {
        setErrors((prev) => ({
          ...prev,
          password: "*아이디와 비밀번호를 다시 확인해주세요.",
        }));
      } else if (error.code === "INVALID_INPUT_VALUE") {
        setErrors({
          email: "",
          password: "*아이디와 비밀번호 값이 올바르지 않습니다.",
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          password: "로그인에 실패했습니다. 다시 시도해주세요.",
          console: error.message,
        }));
      }
    }
  };

  return (
    <div className="page-login">
      <div className="auth-lg">
        <div className="auth">
          <div className="auth-info-wrapper">
            <img
              src="@/assets/images/logo.svg"
              alt="KTB3 커뮤니티 로고"
              className="logo-image"
            />
            <h1 className="auth-title">D'velop</h1>
            <span className="logo-text">로그인하여 커뮤니티에 참여하세요</span>
          </div>

          <form className="auth-form" noValidate onSubmit={handleSubmit}>
            {/* 이메일 입력 필드 */}
            <Input
              label="이메일"
              Icon={MdEmail}
              name="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur} // 포커스가 벗어날 때 유효성 검사 실행
              error={errors.email}
            />
            {/* 비밀번호 입력 필드 */}
            <Input
              label="비밀번호"
              Icon={MdLockOutline}
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
            />
            <Button
              type="submit"
              className="btn-login"
              disabled={!isButtonActive}
              Icon={MdLogin}
            >
              로그인
            </Button>
          </form>
          <Link to="/signup" className="link-signup">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
