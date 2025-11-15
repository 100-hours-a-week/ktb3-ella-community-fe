import {
  getStoredUser,
  saveStoredUser,
  requireAuthUser,
  clearStoredUser,
} from "./utils/user.js";
import {
  checkAvailability,
  updateUserProfile as updateUserProfileApi,
  deleteCurrentUser,
} from "./services/api.js";
import { createImageUploadController } from "./utils/imageUploadController.js";

const ERROR_REQUIRED = "*닉네임을 입력해주세요.";
const ERROR_LENGTH = "*닉네임은 최대 11자까지 가능합니다.";
const ERROR_DUPLICATE = "*중복된 닉네임입니다.";

let originalNickname = "";
let profileImageUploader = null;

const showToast = (toastEl) => {
  if (!toastEl) return;
  toastEl.classList.add("show");
  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2000);
};

/** 닉네임 기본 유효성 */
const validateNickname = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return ERROR_REQUIRED;
  if (trimmed.length > 10) return ERROR_LENGTH;
  return "";
};

// 닉네임 기본 유효성 검사 + 중복 검사
const validateAndCheckNickname = async (nicknameInput, nicknameErrorEl) => {
  const value = nicknameInput.value;
  const trimmed = value.trim();

  // 기본 유효성 검사
  const basicMsg = validateNickname(value);
  nicknameInput.dataset.valid = "false";

  if (nicknameErrorEl) nicknameErrorEl.textContent = basicMsg;

  if (basicMsg) {
    return false;
  }

  // 기존 닉네임이면 중복 체크 스킵
  if (trimmed === originalNickname) {
    if (nicknameErrorEl) nicknameErrorEl.textContent = "";
    nicknameInput.dataset.valid = "true";
    return true;
  }

  // 중복 체크
  try {
    const { nicknameAvailable } = await checkAvailability({ nickname: trimmed });

    if (!nicknameAvailable) {
      if (nicknameErrorEl) nicknameErrorEl.textContent = ERROR_DUPLICATE;
      nicknameInput.dataset.valid = "false";
      return false;
    }

    if (nicknameErrorEl) nicknameErrorEl.textContent = "";
    nicknameInput.dataset.valid = "true";
    return true;
  } catch (e) {
    if (nicknameErrorEl) nicknameErrorEl.textContent = e.message;
    nicknameInput.dataset.valid = "false";
    return false;
  }
};

/** PATCH /api/users/me/{userId} 요청 */
const requestUserUpdate = async ({ nickname, profileImageUrl }) => {
  const user = requireAuthUser();
  if (!user) {
    throw new Error("로그인이 필요합니다. 다시 로그인해주세요.");
  }

  const normalizedProfileImageUrl = (profileImageUrl || "").trim();

  const updated = await updateUserProfileApi({
    userId: user.id,
    nickname: nickname.trim(),
    profileImageUrl: normalizedProfileImageUrl,
  });

  const sanitized = {
    ...updated,
    profileImageUrl:
      (updated && updated.profileImageUrl) || normalizedProfileImageUrl,
  };

  const newUser = {
    ...user,
    email: sanitized.email,
    nickname: sanitized.nickname,
    profileImageUrl: sanitized.profileImageUrl,
  };
  saveStoredUser(newUser);

  originalNickname = sanitized.nickname;

  return sanitized;
};

/** 회원탈퇴 DELETE /api/users/me/{userId} */
const requestUserDelete = async () => {
  const user = requireAuthUser();
  if (!user) {
    throw new Error("로그인이 필요합니다. 다시 로그인해주세요.");
  }

  await deleteCurrentUser({ userId: user.id });
};

// 회원탈퇴 모달 열기/닫기 
const openUserDeleteModal = (modal) => modal?.classList.add("active");
const closeUserDeleteModal = (modal) => modal?.classList.remove("active");

// 버튼 활성화 체크
const updateSubmitButtonState = ({ nicknameInput, submitBtn }) => {
  if (!nicknameInput || !submitBtn) return;

  const hasText = !!nicknameInput.value.trim();
  const valid = nicknameInput.dataset.valid === "true";

  if (hasText && valid) {
    submitBtn.disabled = false;
    submitBtn.classList.add("active");
  } else {
    submitBtn.disabled = true;
    submitBtn.classList.remove("active");
  }
};

// 폼 submit 핸들러 

const handleFormSubmit = async ({
  event,
  nicknameInput,
  nicknameErrorEl,
  submitBtn,
  imageUploader,
  toastEl,
}) => {
  event.preventDefault();

  // 닉네임 최종 검증
  const isValid = await validateAndCheckNickname(
    nicknameInput,
    nicknameErrorEl
  );
  updateSubmitButtonState({ nicknameInput, submitBtn });

  if (!isValid) {
    return;
  }

  submitBtn.disabled = true;

  let profileImageUrlToSave = imageUploader?.getCurrentUrl() || "";

  if (imageUploader) {
    try {
      profileImageUrlToSave = await imageUploader.ensureUploaded();
    } catch (uploadError) {
      alert(
        uploadError.message || "프로필 이미지 업로드 중 오류가 발생했습니다."
      );
      submitBtn.disabled = false;
      return;
    }
  }

  try {
    const updated = await requestUserUpdate({
      nickname: nicknameInput.value,
      profileImageUrl: profileImageUrlToSave,
    });
    const syncedUrl =
      (updated && updated.profileImageUrl) || profileImageUrlToSave;
    imageUploader?.setUploadedUrl(syncedUrl);

    showToast(toastEl);
    updateSubmitButtonState({ nicknameInput, submitBtn });
  } catch (err) {
    alert(err.message || "회원정보 수정 중 오류가 발생했습니다.");
  } finally {
    submitBtn.disabled = false;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuthUser();
  if (!user) return;

  const emailValueEl = document.querySelector("#email-value");
  const nicknameInput = document.querySelector("#nickname");
  const nicknameErrorEl = document.querySelector("#user-nickname-error");
  const profileImageEl = document.querySelector("#profile-image");
  const profileImageBtn = document.querySelector(".profile-img-change");
  const profileImageInput = document.querySelector("#profile-image-input");
  const form = document.querySelector(".auth-form");
  const submitBtn = document.querySelector(".btn-form-primary");
  const withdrawBtn = document.querySelector(".link-withdraw");
  const userDeleteModal = document.querySelector("#user-delete-modal");
  const toastEl = document.querySelector("#update-toast");

  if (!nicknameInput || !form || !submitBtn || !profileImageEl) {
    console.warn("회원정보 수정 필수 요소를 찾을 수 없습니다.");
    return;
  }

  if (emailValueEl) emailValueEl.textContent = user.email || "";
  const initialProfileImageSrc = profileImageEl.src || "";
  const initialUploadedImageUrl =
    (user.profileImageUrl && user.profileImageUrl.trim()) ||
    initialProfileImageSrc;

  if (profileImageInput) {
    profileImageUploader = createImageUploadController({
      inputEl: profileImageInput,
      previewEl: profileImageEl,
      defaultPreview: initialProfileImageSrc,
      onError: (error) => {
        alert(error?.message || "업로드 URL 발급 중 오류가 발생했습니다.");
      },
    });
    profileImageUploader.setUploadedUrl(initialUploadedImageUrl);

    profileImageBtn?.addEventListener("click", () =>
      profileImageUploader?.openFilePicker()
    );
    profileImageInput.addEventListener("change", () => {
      profileImageUploader?.handleFileChange();
    });
  }

  // 닉네임 초기 상태 설정
  originalNickname = user.nickname || "";
  nicknameInput.value = originalNickname;
  nicknameInput.dataset.valid = "true";
  submitBtn.disabled = true;
  submitBtn.classList.remove("active");
  if (nicknameErrorEl) nicknameErrorEl.textContent = "";

  // 입력 중에는 "아직 검증 안 됨" 상태로 만들기
  nicknameInput.addEventListener("input", () => {
    if (nicknameErrorEl) nicknameErrorEl.textContent = "";
    nicknameInput.dataset.valid = "false";
    updateSubmitButtonState({ nicknameInput, submitBtn });
  });

  // 포커스 아웃 시 서버 중복 체크 포함 검증
  nicknameInput.addEventListener("blur", async () => {
    await validateAndCheckNickname(nicknameInput, nicknameErrorEl);
    updateSubmitButtonState({ nicknameInput, submitBtn });
  });

  // 폼 제출
  form.addEventListener("submit", (e) =>
    handleFormSubmit({
      event: e,
      nicknameInput,
      nicknameErrorEl,
      submitBtn,
      imageUploader: profileImageUploader,
      toastEl,
    })
  );

  // 회원탈퇴
  if (withdrawBtn && userDeleteModal) {
    const cancelBtn = userDeleteModal.querySelector(".modal-cancel");
    const confirmBtn = userDeleteModal.querySelector(".modal-confirm");

    withdrawBtn.addEventListener("click", () =>
      openUserDeleteModal(userDeleteModal)
    );

    cancelBtn?.addEventListener("click", () =>
      closeUserDeleteModal(userDeleteModal)
    );

    userDeleteModal.addEventListener("click", (e) => {
      if (e.target === userDeleteModal) {
        closeUserDeleteModal(userDeleteModal);
      }
    });

    confirmBtn?.addEventListener("click", async () => {
      try {
        await requestUserDelete();
        clearStoredUser();
        closeUserDeleteModal(userDeleteModal);
        window.location.href = "./login.html";
      } catch (err) {
        alert(err.message || "회원 탈퇴 중 오류가 발생했습니다.");
      }
    });
  }
});
