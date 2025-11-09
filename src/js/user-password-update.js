"use strict";

import { requireAuthUser } from "./utils/user.js";
const PASSWORD_UPDATE_ENDPOINT = "/api/users/me/password";

// 회원가입과 동일: 8~20자, 대/소문자/숫자/특수문자 1개 이상
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,20}$/;

const validatePassword = (value) => {
  if (!value.trim()) return "*비밀번호를 입력해주세요.";
  if (!PASSWORD_PATTERN.test(value))
    return "*비밀번호는 8~20자, 대문자/소문자/숫자/특수문자를 각각 최소 1개 포함해야 합니다.";
  return "";
};

const validateConfirmPassword = (password, confirm) => {
  if (!confirm.trim()) return "*비밀번호를 한번 더 입력해주세요.";
  if (password !== confirm) return "*비밀번호가 일치하지 않습니다.";
  return "";
};

const showToast = (toastEl) => {
  if (!toastEl) return;
  toastEl.classList.add("show");
  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2000);
};

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuthUser();
  if (!user) return;

  const form = document.querySelector(".auth-form");
  const passwordInput = document.querySelector("#password");
  const passwordCheckInput = document.querySelector("#password-check");
  const passwordError = document.querySelector("#password-error");
  const passwordConfirmError = document.querySelector(
    "#password-confirm-error"
  );
  const submitButton = document.querySelector(".btn-login.btn-form-primary");
  const toastEl = document.querySelector("#update-toast");

  if (
    !form ||
    !passwordInput ||
    !passwordCheckInput ||
    !passwordError ||
    !passwordConfirmError ||
    !submitButton
  ) {
    console.warn("비밀번호 수정 폼 요소를 찾을 수 없습니다.");
    return;
  }

  // 초기 상태: 비활성
  submitButton.disabled = true;
  submitButton.classList.remove("active");

  const updateSubmitState = () => {
    const pwMsg = validatePassword(passwordInput.value);
    const cfMsg = validateConfirmPassword(
      passwordInput.value,
      passwordCheckInput.value
    );

    const isValid = !pwMsg && !cfMsg;

    if (isValid) {
      submitButton.disabled = false;
      submitButton.classList.add("active");
    } else {
      submitButton.disabled = true;
      submitButton.classList.remove("active");
    }
  };

  // 비밀번호 blur
  passwordInput.addEventListener("blur", () => {
    const msg = validatePassword(passwordInput.value);
    passwordError.textContent = msg;
    updateSubmitState();
  });

  // 비밀번호 확인 blur
  passwordCheckInput.addEventListener("blur", () => {
    const msg = validateConfirmPassword(
      passwordInput.value,
      passwordCheckInput.value
    );
    passwordConfirmError.textContent = msg;
    updateSubmitState();
  });

  // 입력 중에는 에러 줄이면서 실시간 상태 체크
  passwordInput.addEventListener("input", () => {
    if (passwordError.textContent) {
      passwordError.textContent = "";
    }
    updateSubmitState();
  });

  passwordCheckInput.addEventListener("input", () => {
    if (passwordConfirmError.textContent) {
      passwordConfirmError.textContent = "";
    }
    updateSubmitState();
  });

  const requestPasswordUpdate = async (newPassword) => {
    const current = requireAuthUser();
    if (!current) return;

    const res = await fetch(
      `${PASSWORD_UPDATE_ENDPOINT}/${encodeURIComponent(current.id)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      }
    );

    // 204 expected
    if (!res.ok) {
      let msg = "비밀번호 수정에 실패했습니다.";
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (_) {
        // no body
      }
      throw new Error(msg);
    }
  };

  // 폼 제출
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pwMsg = validatePassword(passwordInput.value);
    const cfMsg = validateConfirmPassword(
      passwordInput.value,
      passwordCheckInput.value
    );

    passwordError.textContent = pwMsg;
    passwordConfirmError.textContent = cfMsg;

    if (pwMsg || cfMsg) {
      updateSubmitState();
      return;
    }

    submitButton.disabled = true;

    try {
      await requestPasswordUpdate(passwordInput.value);
      // 성공 시 토스트
      showToast(toastEl);

      // 입력값 초기화 + 버튼 비활성화
      passwordInput.value = "";
      passwordCheckInput.value = "";
      passwordError.textContent = "";
      passwordConfirmError.textContent = "";
      updateSubmitState();
    } catch (err) {
      alert(err.message || "비밀번호 수정 중 오류가 발생했습니다.");
    } finally {
      submitButton.disabled = true; // 유효성 다시 채우기 전까지 비활성
      submitButton.classList.remove("active");
    }
  });
});
