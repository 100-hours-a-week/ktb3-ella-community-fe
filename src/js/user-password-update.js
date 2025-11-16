import {
  validatePassword,
  validateConfirmPassword,
} from "./utils/validation.js";
import { requireAuthUser } from "./utils/user.js";
import { updateUserPassword } from "./services/api.js";

const ensureAuthUser = () => {
  const user = requireAuthUser();
  if (!user) {
    alert("로그인이 필요합니다.");
    window.location.href = "./login.html";
    return null;
  }
  return user;
};

const showToast = (toastEl) => {
  if (!toastEl) return;
  toastEl.classList.add("show");
  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2000);
};

document.addEventListener("DOMContentLoaded", () => {
  const user = ensureAuthUser();
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

  submitButton.disabled = true;
  submitButton.classList.remove("active");

  const updateSubmitState = () => {
    const pwMsg = validatePassword(passwordInput.value);
    const cfMsg = validateConfirmPassword(
      passwordCheckInput.value,
      passwordInput.value,
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
      passwordCheckInput.value,
      passwordInput.value,
    );
    passwordConfirmError.textContent = msg;
    updateSubmitState();
  });

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
    const current = ensureAuthUser();
    if (!current) return;

    await updateUserPassword({
      userId: current.id,
      newPassword: newPassword.trim(),
    });
  };

  // 폼 제출
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pwMsg = validatePassword(passwordInput.value);
    const cfMsg = validateConfirmPassword(
      passwordCheckInput.value,
      passwordInput.value,
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
      showToast(toastEl);

      passwordInput.value = "";
      passwordCheckInput.value = "";
      passwordError.textContent = "";
      passwordConfirmError.textContent = "";
      updateSubmitState();
    } catch (err) {
      alert(err.message || "비밀번호 수정 중 오류가 발생했습니다.");
    } finally {
      submitButton.disabled = true;
      submitButton.classList.remove("active");
    }
  });
});
