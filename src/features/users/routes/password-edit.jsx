import React, { useCallback, useState } from "react";
import { FaLock } from "react-icons/fa6";
import { useMutation } from "@tanstack/react-query";
import {
  validatePassword,
  validateConfirmPassword,
} from "@/shared/utils/validation";
import { updateUserPassword } from "@/features/users/api/user-api";
import { useTransientToast } from "@/shared/hooks/use-transient-toast.js";

import Input from "@/components/common/input";
import Button from "@/components/common/button";
import Toast from "@/components/common/toast";

const PasswordEdit = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const { isVisible: isToastOpen, show: showToast } = useTransientToast();

  const passwordMutation = useMutation({
    mutationFn: (newPassword) => updateUserPassword({ newPassword }),

    onSuccess: () => {
      setPassword("");
      setConfirmPassword("");
      setErrors({ password: "", confirmPassword: "" });
      showToast("수정 완료");
    },

    onError: (error) => {
      console.error(error);
      alert("비밀번호 수정 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handlePasswordBlur = () => {
    const msg = validatePassword(password);
    setErrors((prev) => ({ ...prev, password: msg }));
  };

  const handleConfirmBlur = () => {
    const msg = validateConfirmPassword(confirmPassword, password);
    setErrors((prev) => ({ ...prev, confirmPassword: msg }));
  };

  const handleChange = useCallback(
    (setter, field) => (e) => {
      setter(e.target.value);
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pwMsg = validatePassword(password);
    const cfMsg = validateConfirmPassword(confirmPassword, password);

    setErrors({ password: pwMsg, confirmPassword: cfMsg });

    if (pwMsg || cfMsg) return;

    passwordMutation.mutate(password);
  };

  const isValid =
    password && confirmPassword && !errors.password && !errors.confirmPassword;
  const isSubmitting = passwordMutation.isPending;

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

      <Toast open={isToastOpen} message="수정 완료" />
    </div>
  );
};

export default PasswordEdit;
