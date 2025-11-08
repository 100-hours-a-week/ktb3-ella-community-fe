"use strict";

const LOGIN_ENDPOINT = "/api/auth/login";

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// 비밀번호 정규식: 8~20자, 대문자+소문자+숫자+특수문자 모두 포함
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,20}$/;

const form = document.querySelector(".auth-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const emailError = document.querySelector("#email-error");
const passwordError = document.querySelector("#password-error");
const submitButton = document.querySelector(".btn-login.btn-form-primary");

let emailTimer;
let passwordTimer;

// 안전장치: 폼이 없으면 더 진행 안 함
if (
  !form ||
  !emailInput ||
  !passwordInput ||
  !emailError ||
  !passwordError ||
  !submitButton
) {
  console.warn("로그인 폼 요소를 찾을 수 없습니다.");
}

// 이메일 검증 함수
const validateEmail = (value) => {
  if (!value.trim()) return "올바른 이메일 주소 형식을 입력해주세요.";
  if (!EMAIL_PATTERN.test(value))
    return "올바른 이메일 주소 형식을 입력해주세요.";
  return "";
};

// 비밀번호 검증 함수
const validatePassword = (value) => {
  if (!value.trim()) return "비밀번호를 입력해주세요.";
  if (!PASSWORD_PATTERN.test(value))
    return "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
  return "";
};

// 유효성 검증 및 버튼 활성화 확인
const checkValidation = () => {
  const emailValid = !validateEmail(emailInput.value);
  const passwordValid = !validatePassword(passwordInput.value);

  if (emailValid && passwordValid) {
    submitButton.classList.add("active");
  } else {
    submitButton.classList.remove("active");
  }
};

// 이메일 입력 시 2초간 멈출 때 자동 검사
emailInput.addEventListener("input", () => {
  clearTimeout(emailTimer);
  emailTimer = setTimeout(() => {
    const message = validateEmail(emailInput.value);
    emailError.textContent = message;
    checkValidation();
  }, 2000);
});

// 비밀번호 입력 시 2초간 멈출 때 자동 검사
passwordInput.addEventListener("input", () => {
  clearTimeout(passwordTimer);
  passwordTimer = setTimeout(() => {
    const message = validatePassword(passwordInput.value);
    passwordError.textContent = message;
    checkValidation();
  }, 2000);
});

// 실제 서버로 로그인 요청 보내는 함수
const requestLogin = async ({ email, password }) => {
  const response = await fetch(LOGIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (result.code === "USER_NOT_FOUND") {
      // 존재하지 않는 사용자
      throw new Error("아이디 또는 비밀번호를 확인해주세요.");
    } else if (result.message) {
      // 서버에서 message 내려주면 그대로 표시
      throw new Error(result.message);
    } else {
      throw new Error("로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }
  return result;
};

// 폼 제출 이벤트 핸들러
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const emailMsg = validateEmail(emailInput.value);
  const passwordMsg = validatePassword(passwordInput.value);

  emailError.textContent = emailMsg;
  passwordError.textContent = passwordMsg;

  // 둘 중 하나라도 에러 있으면 전송 안 함
  if (emailMsg || passwordMsg) {
    return;
  }

  // 버튼/폼 로딩 상태 표시
  submitButton.disabled = true;
  submitButton.classList.add("is-loading");

  try {
    await requestLogin({
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
    });

    // 로그인 성공 시 이동할 페이지
    window.location.href = "./post-list.html";
  } catch (error) {
    // 서버에서 온 에러 메시지
    passwordError.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
  }
});
