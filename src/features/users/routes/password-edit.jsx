import React, { useState } from "react";
import { FaLock } from "react-icons/fa6";

import { useAuthStore } from "@/shared/stores/use-auth-store";
import {
  validatePassword,
  validateConfirmPassword,
} from "@/shared/utils/validation";
import { updateUserPassword } from "@/features/users/api/user-api";

import Input from "@/components/common/input";
import Button from "@/components/common/button";

const PasswordEdit = () => {
  const { user } = useAuthStore();

  // --- 상태 관리 ---
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 핸들러 ---

  // 비밀번호 검증
  const handlePasswordBlur = () => {
    const msg = validatePassword(password);
    setErrors((prev) => ({ ...prev, password: msg }));
  };

  // 비밀번호 확인 검증
  const handleConfirmBlur = () => {
    const msg = validateConfirmPassword(confirmPassword, password);
    setErrors((prev) => ({ ...prev, confirmPassword: msg }));
  };

  // 입력 시 에러 초기화 및 상태 업데이트
  const handleChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 최종 검증
    const pwMsg = validatePassword(password);
    const cfMsg = validateConfirmPassword(confirmPassword, password);

    setErrors({ password: pwMsg, confirmPassword: cfMsg });

    if (pwMsg || cfMsg) return;

    setIsSubmitting(true);
    try {
      await updateUserPassword({ newPassword: password });

      // 성공 처리
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

      // 입력창 초기화
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert(error.message || "비밀번호 수정 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const isValid =
    password && confirmPassword && !errors.password && !errors.confirmPassword;

  return (
    <div className="auth-lg">
      <div className="auth">
        <h1 className="auth-title">비밀번호 수정</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* 비밀번호 */}
          <Input
            label="비밀번호"
            name="password"
            type="password"
            Icon={FaLock}
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={handleChange(setPassword, "password")}
            onBlur={handlePasswordBlur}
            error={errors.password}
          />

          {/* 비밀번호 확인 */}
          <Input
            label="비밀번호 확인"
            name="confirmPassword"
            type="password"
            Icon={FaLock}
            placeholder="비밀번호를 한번 더 입력하세요"
            value={confirmPassword}
            onChange={handleChange(setConfirmPassword, "confirmPassword")}
            onBlur={handleConfirmBlur}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="btn-login"
          >
            {isSubmitting ? "처리 중..." : "수정하기"}
          </Button>
        </form>
      </div>

      {/* 토스트 메시지 */}
      <div className={`toast ${showToast ? "show" : ""}`}>수정 완료</div>
    </div>
  );
};

export default PasswordEdit;
