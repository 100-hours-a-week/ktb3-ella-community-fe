"use strict";

import { saveStoredUser } from "./utils/user.js";

const SIGNUP_ENDPOINT = "/api/auth/signup";
const AVAILABILITY_ENDPOINT = "/api/users/availability";

const DEFAULT_PROFILE_IMAGE_URL = "public/images/userProfile.png";

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// 비밀번호 정규식: 8~20자, 대문자+소문자+숫자+특수문자 모두 포함
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,20}$/;

const form = document.querySelector(".auth-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#password-confirm");
const nicknameInput = document.querySelector("#nickname");

const emailError = document.querySelector("#email-error");
const passwordError = document.querySelector("#password-error");
const passwordConfirmError = document.querySelector("#password-confirm-error");
const nicknameError = document.querySelector("#nickname-error");

const submitButton = document.querySelector(".btn-login.btn-form-primary");
// 안전장치
if (
  !form ||
  !emailInput ||
  !passwordInput ||
  !passwordConfirmInput ||
  !nicknameInput ||
  !emailError ||
  !passwordError ||
  !passwordConfirmError ||
  !nicknameError ||
  !submitButton
) {
  console.warn("회원가입 폼 요소를 찾을 수 없습니다.");
}

// ====== 유효성 함수 ======
const validateEmail = (value) => {
  if (!value.trim()) return "*이메일을 입력해주세요.";
  if (!EMAIL_PATTERN.test(value))
    return "*올바른 이메일 주소 형식을 입력해주세요. (예:example@example.com)";
  return "";
};

const validatePassword = (value) => {
  if (!value.trim()) return "*비밀번호를 입력해주세요.";
  if (!PASSWORD_PATTERN.test(value))
    return "*비밀번호는 8~20자, 대문자/소문자/숫자/특수문자를 각각 최소 1개 포함해야 합니다.";
  return "";
};

const validateConfirmPassword = (value) => {
  if (!value.trim()) return "*비밀번호를 한번 더 입력해주세요.";
  if (value !== passwordInput.value) return "*비밀번호가 일치하지 않습니다.";
  return "";
};

const validateNickname = (value) => {
  if (!value.trim()) return "닉네임을 입력해주세요.";
  if (/\s/.test(value)) return "*띄어쓰기를 없애주세요.";
  if (value.length > 10) return "*닉네임은 최대 10자까지 작성 가능합니다.";
  if (value.length < 2 || value.length > 12)
    return "닉네임은 2자 이상 12자 이하로 입력해주세요.";
  return "";
};

// ====== 중복 체크 공통 함수 ======
const checkAvailability = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${AVAILABILITY_ENDPOINT}?${query}`, {
    method: "GET",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.data) {
    throw new Error("중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
  return result.data; // { emailAvailable, nicknameAvailable }
};

// ====== 전체 검증 & 버튼 활성화 ======
const checkValidation = () => {
  const emailValid = emailInput.dataset.valid === "true";
  const nicknameValid = nicknameInput.dataset.valid === "true";
  const passwordValid = !validatePassword(passwordInput.value);
  const confirmValid = !validateConfirmPassword(passwordConfirmInput.value);

  if (emailValid && nicknameValid && passwordValid && confirmValid) {
    submitButton.disabled = false;
    submitButton.classList.add("active");
  } else {
    submitButton.disabled = true;
    submitButton.classList.remove("active");
  }
};

// ====== 이벤트 바인딩 ======

// 이메일 blur: 형식 → 중복 체크
emailInput.addEventListener("blur", async () => {
  const basicMsg = validateEmail(emailInput.value);
  emailError.textContent = basicMsg;
  emailInput.dataset.valid = "false";

  if (basicMsg) {
    checkValidation();
    return;
  }

  try {
    const { emailAvailable } = await checkAvailability({
      email: emailInput.value.trim(),
    });

    if (!emailAvailable) {
      emailError.textContent = "중복된 이메일입니다.";
      emailInput.dataset.valid = "false";
    } else {
      emailError.textContent = "";
      emailInput.dataset.valid = "true";
    }
  } catch (e) {
    emailError.textContent = e.message;
    emailInput.dataset.valid = "false";
  }

  checkValidation();
});

// 닉네임 blur: 기본 → 중복 체크
nicknameInput.addEventListener("blur", async () => {
  const basicMsg = validateNickname(nicknameInput.value);
  nicknameError.textContent = basicMsg;
  nicknameInput.dataset.valid = "false";

  if (basicMsg) {
    checkValidation();
    return;
  }

  try {
    const { nicknameAvailable } = await checkAvailability({
      nickname: nicknameInput.value.trim(),
    });

    if (!nicknameAvailable) {
      nicknameError.textContent = "중복된 닉네임입니다.";
      nicknameInput.dataset.valid = "false";
    } else {
      nicknameError.textContent = "";
      nicknameInput.dataset.valid = "true";
    }
  } catch (e) {
    nicknameError.textContent = e.message;
    nicknameInput.dataset.valid = "false";
  }

  checkValidation();
});

// 비밀번호 blur
passwordInput.addEventListener("blur", () => {
  const msg = validatePassword(passwordInput.value);
  passwordError.textContent = msg;
  checkValidation();
});

// 비밀번호 확인 blur
passwordConfirmInput.addEventListener("blur", () => {
  const msg = validateConfirmPassword(passwordConfirmInput.value);
  passwordConfirmError.textContent = msg;
  checkValidation();
});

// ====== 회원가입 요청 ======
const requestSignup = async ({ email, password, nickname, profileImageUrl }) => {
  const response = await fetch(SIGNUP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, nickname, profileImageUrl }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "회원가입에 실패했습니다.");
  }
  return result;
};

// ====== 폼 제출 ======
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // 마지막으로 한 번 더 체크
  const emailMsg = validateEmail(emailInput.value);
  const pwMsg = validatePassword(passwordInput.value);
  const confirmMsg = validateConfirmPassword(passwordConfirmInput.value);
  const nickMsg = validateNickname(nicknameInput.value);

  emailError.textContent = emailMsg;
  passwordError.textContent = pwMsg;
  passwordConfirmError.textContent = confirmMsg;
  nicknameError.textContent = nickMsg;

  if (emailMsg || pwMsg || confirmMsg || nickMsg) {
    return;
  }

  if (
    emailInput.dataset.valid !== "true" ||
    nicknameInput.dataset.valid !== "true"
  ) {
    // 중복 미통과 or 아직 안함
    return;
  }

  submitButton.disabled = true;
  submitButton.classList.add("is-loading");

  const payload = {
    email: emailInput.value.trim(),
    password: passwordInput.value.trim(),
    nickname: nicknameInput.value.trim(),
    profileImageUrl: DEFAULT_PROFILE_IMAGE_URL,
  };

  try {
    const { data } = await requestSignup(payload);
    saveStoredUser(data);

    // 성공 시 페이지 이동 
    window.location.href = "./login.html";
  } catch (error) {
    // 공통 에러는 이메일/닉네임/비밀번호 중 적절한 곳에 표시해도 됨
    passwordError.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
  }
});
