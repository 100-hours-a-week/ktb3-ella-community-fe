import { saveStoredUser } from "./utils/user.js";
import {
  fetchMe,
  requestLogin,
  setAccessToken,
} from "./services/api.js";
import { validateEmail, validatePassword } from "./utils/validation.js";

const form = document.querySelector(".auth-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const emailError = document.querySelector("#email-error");
const passwordError = document.querySelector("#password-error");
const submitButton = document.querySelector(".btn-login.btn-form-primary");

const checkValidation = () => {
  const emailValid = !validateEmail(emailInput.value);
  const passwordValid = !validatePassword(passwordInput.value);

  if (emailValid && passwordValid) {
    submitButton.classList.add("active");
  } else {
    submitButton.classList.remove("active");
  }
};

export const initPage = () => {
  if (
    !form ||
    !emailInput ||
    !passwordInput ||
    !emailError ||
    !passwordError ||
    !submitButton
  ) {
    console.warn("로그인 폼 요소를 찾을 수 없습니다.");
    return;
  }

  emailInput.addEventListener("blur", () => {
    const message = validateEmail(emailInput.value);
    emailError.textContent = message;
    checkValidation();
  });

  passwordInput.addEventListener("blur", () => {
    const message = validatePassword(passwordInput.value);
    passwordError.textContent = message;
    checkValidation();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailMsg = validateEmail(emailInput.value);
    const passwordMsg = validatePassword(passwordInput.value);
    if (emailMsg || passwordMsg) return;

    submitButton.disabled = true;
    submitButton.classList.add("is-loading");

    try {
      const { accessToken } = await requestLogin({
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
      });
      setAccessToken(accessToken);
      const userData = await fetchMe();
      saveStoredUser(userData);
      window.location.href = "./post-list.html";
    } catch (error) {
      passwordError.textContent = error.message;
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
    }
  });
};
