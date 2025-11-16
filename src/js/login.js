import { saveStoredUser } from "./utils/user.js";
import { requestLogin } from "./services/api.js";
import { validateEmail, validatePassword } from "./utils/validation.js";

const form = document.querySelector(".auth-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const emailError = document.querySelector("#email-error");
const passwordError = document.querySelector("#password-error");
const submitButton = document.querySelector(".btn-login.btn-form-primary");

let emailTimer;
let passwordTimer;

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

// 이메일 포커스 아웃 자동 검사
emailInput.addEventListener("blur", () => {
  const message = validateEmail(emailInput.value);
  emailError.textContent = message;
  checkValidation();
});

// 비밀번호 포커스 아웃 자동 검사
passwordInput.addEventListener("blur", () => {
  const message = validatePassword(passwordInput.value);
  passwordError.textContent = message;
  checkValidation();
});

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
    const data = await requestLogin({
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
    });

    saveStoredUser(data);

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
