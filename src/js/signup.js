import { saveStoredUser } from "./utils/user.js";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "./utils/validation.js";
import { checkAvailability, requestSignup } from "./services/api.js";
import { createImageUploadController } from "./utils/imageUploadController.js";

const form = document.querySelector(".auth-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#password-confirm");
const nicknameInput = document.querySelector("#nickname");

const emailError = document.querySelector("#email-error");
const passwordError = document.querySelector("#password-error");
const passwordConfirmError = document.querySelector("#password-confirm-error");
const nicknameError = document.querySelector("#nickname-error");

const profileImageInput = document.querySelector("#profile-image-input");
const profileImageWrapper = document.querySelector(".auth-profile-image");
let profileImagePreview =
  profileImageWrapper?.querySelector(".profile-image-preview") || null;
const profileImageError = document.querySelector("#profile-image-error");

if (!profileImagePreview && profileImageWrapper) {
  profileImagePreview = document.createElement("img");
  profileImagePreview.className = "profile-image-preview";
  profileImagePreview.alt = "프로필 미리보기";
  profileImagePreview.style.display = "none";
  profileImageWrapper.appendChild(profileImagePreview);
}

const submitButton = document.querySelector(".btn-login.btn-form-primary");

let profileImageUploader = null;

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

const validateNickname = (value) => {
  if (!value.trim()) return "닉네임을 입력해주세요.";
  if (/\s/.test(value)) return "*띄어쓰기를 없애주세요.";
  if (value.length > 10) return "*닉네임은 최대 10자까지 작성 가능합니다.";
  if (value.length < 2 || value.length > 12)
    return "닉네임은 2자 이상 12자 이하로 입력해주세요.";
  return "";
};

// 전체 검증 & 버튼 활성화
const checkValidation = () => {
  const emailValid = emailInput.dataset.valid === "true";
  const nicknameValid = nicknameInput.dataset.valid === "true";
  const passwordValid = !validatePassword(passwordInput.value);
  const confirmValid = !validateConfirmPassword(
    passwordConfirmInput.value,
    passwordInput.value
  );

  if (emailValid && nicknameValid && passwordValid && confirmValid) {
    submitButton.disabled = false;
    submitButton.classList.add("active");
  } else {
    submitButton.disabled = true;
    submitButton.classList.remove("active");
  }
};

const setupProfileImageUploader = () => {
  if (!profileImageInput || !profileImagePreview || !profileImageWrapper)
    return;

  profileImageUploader = createImageUploadController({
    inputEl: profileImageInput,
    previewEl: profileImagePreview,
    defaultPreview: "",
    onError: (error) => {
      if (profileImageError) {
        profileImageError.textContent =
          error?.message || "프로필 이미지를 준비할 수 없습니다.";
      }
    },
    onPreviewStateChange: (hasPreview) => {
      profileImageWrapper.classList.toggle("has-preview", hasPreview);
    },
  });

  profileImageUploader.setUploadedUrl("");

  profileImageWrapper.addEventListener("click", () => {
    if (profileImageError) profileImageError.textContent = "";
    profileImageUploader?.openFilePicker();
  });

  profileImageInput.addEventListener("change", () => {
    if (profileImageError) profileImageError.textContent = "";
    profileImageUploader?.handleFileChange();
  });
};

const setupAutoScrollInputs = () => {
  const inputs = [
    profileImageInput,
    emailInput,
    passwordInput,
    passwordConfirmInput,
    nicknameInput,
  ].filter(Boolean);

  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
};

export const initPage = () => {
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
    return;
  }

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

  passwordInput.addEventListener("blur", () => {
    const msg = validatePassword(passwordInput.value);
    passwordError.textContent = msg;
    checkValidation();
  });

  passwordConfirmInput.addEventListener("blur", () => {
    const msg = validateConfirmPassword(
      passwordConfirmInput.value,
      passwordInput.value
    );
    passwordConfirmError.textContent = msg;
    checkValidation();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailMsg = validateEmail(emailInput.value);
    const pwMsg = validatePassword(passwordInput.value);
    const confirmMsg = validateConfirmPassword(
      passwordConfirmInput.value,
      passwordInput.value
    );
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
      return;
    }

    submitButton.disabled = true;
    submitButton.classList.add("is-loading");

    let profileImageUrl = "";

    if (profileImageUploader) {
      try {
        const uploadedUrl = await profileImageUploader.ensureUploaded();
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        }
      } catch (uploadError) {
        if (profileImageError) {
          profileImageError.textContent =
            uploadError?.message || "프로필 이미지를 업로드할 수 없습니다.";
        }
        submitButton.disabled = false;
        submitButton.classList.remove("is-loading");
        return;
      }
    }

    const payload = {
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
      nickname: nicknameInput.value.trim(),
      profileImageUrl,
    };

    try {
      const data = await requestSignup(payload);
      saveStoredUser(data);
      window.location.href = "./post-list.html";
    } catch (error) {
      passwordError.textContent = error.message;
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
    }
  });

  setupProfileImageUploader();
  setupAutoScrollInputs();
};
