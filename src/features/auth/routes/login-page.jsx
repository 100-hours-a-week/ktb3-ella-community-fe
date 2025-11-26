import React, { useState } from "react";
import "@/styles/global.css";
import "@/styles/header.css";
import "@/styles/pages/login.css";
import "@/styles/pages/login.css";

import { validateEmail, validatePassword } from "@/utils/validation";

import { saveStoredUser } from "@/features/users/store/user.js";
import {
  fetchMe,
  requestLogin,
  setAccessToken,
} from "@/features/auth/api/api.js";

/**
 * useState를 사용하여 사용자가 입력한 이메일과 비밀번호를 실시간으로 저장
 * -> 화면에 사용자가 입력한 값을 실시간으로 반영
 * formData : 현재 입력된 값들을 담고 있는 객체
 * setFormData : formData 객체를 업데이트하는 함수
 */
const LoginPage = () => {
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

    console.log(formData); // 변경된 입력값을 콘솔에 출력 (디버깅용)
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
    console.log("Validation error for", name, ":", errorMessage, errors);
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

    // 1. 제출 전 마지막 유효성 검사
    const emailMsg = validateEmail(formData.email);
    const passwordMsg = validatePassword(formData.password);

    if (emailMsg || passwordMsg) {
      setErrors({ email: emailMsg, password: passwordMsg });
      return;
    }

    try {
      // 3. 로그인 API 요청
      const { accessToken } = await requestLogin({
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      // 4. 토큰 저장 및 유저 정보 조회
      setAccessToken(accessToken);
      const userData = await fetchMe();
      saveStoredUser(userData);

      // 5. 페이지 이동 (React Router를 쓴다면 navigate('/post-list') 권장)
      window.location.href = "./post-list.html";
    } catch (error) {
      // 6. 에러 처리 로직 (기존 바닐라 JS 로직 이식)
      console.error(error);

      if (error.status === 404) {
        setErrors((prev) => ({
          ...prev,
          password: "*아이디와 비밀번호를 다시 확인해주세요.",
        }));
      } else if (error.status === 422) {
        setErrors({
          email: "",
          password: "*아이디와 비밀번호 값이 올바르지 않습니다.",
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          password: error.message || "로그인에 실패했습니다.",
        }));
      }
    }
  };

  return (
    <div className="page-login">
      <div className="auth-lg">
        <div className="auth">
          {/* ... 상단 로고 영역 생략 ... */}
          <div className="auth-info-wrapper">
            <img
              src="/src/assets/images/logo.svg"
              alt="KTB3 커뮤니티 로고"
              className="logo-image"
            />
            <h1 className="auth-title">D'velop</h1>
            <span className="logo-text">로그인하여 커뮤니티에 참여하세요</span>
          </div>

          {/* form 태그에 onSubmit 이벤트를 연결합니다.
            버튼 클릭뿐만 아니라 인풋에서 엔터 키를 눌러도 handleSubmit이 실행됩니다.
          */}
          <form className="auth-form" noValidate onSubmit={handleSubmit}>
            {/* 이메일 입력 필드 */}
            <div className="field">
              <div className="field-label-wrapper">
                <img
                  src="/src/assets/images/email.svg"
                  alt="email icon"
                  className="logo-email"
                />
                <label htmlFor="email" className="field-label">
                  이메일
                </label>
              </div>
              <input
                id="email"
                name="email" // 이 name 속성이 handleChange의 e.target.name이 됩니다.
                type="email"
                className="field-input"
                placeholder="이메일을 입력하세요"
                value={formData.email} // 리액트 상태와 인풋 값을 동기화 (Controlled Component)
                onChange={handleChange} // 키를 누를 때마다 상태 업데이트
                onBlur={handleBlur} // 포커스가 벗어날 때 유효성 검사 실행
              />
              <p className="error-text" id="email-error">
                {errors.email}
              </p>
            </div>

            {/* 비밀번호 입력 필드 */}
            <div className="field">
              <div className="field-label-wrapper">
                <img
                  src="/src/assets/images/password.svg"
                  alt="password icon"
                  className="logo-password"
                />
                <label htmlFor="password" className="field-label">
                  비밀번호
                </label>
              </div>
              <input
                id="password"
                name="password" // handleChange가 'password' 필드임을 알 수 있게 해줍니다.
                type="password"
                className="field-input"
                placeholder="비밀번호를 입력하세요"
                required
                value={formData.password} // 입력값이 상태(formData.password)에 의해 제어됩니다.
                onChange={handleChange}
                onBlur={handleBlur} // 포커스가 벗어날 때 유효성 검사 실행
              />
              <p className="error-text" id="password-error">
                {errors.password}
              </p>
            </div>

            <button type="submit" className="btn-login btn-form-primary">
              <img
                src="/src/assets/images/login.svg"
                alt="login icon"
                className="logo-login"
              />
              로그인
            </button>
          </form>

          <a href="./signup.html" className="link-signup">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
