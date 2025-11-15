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

const DEFAULT_PROFILE_IMAGE = "/public/images/userProfile.png";

const ERROR_REQUIRED = "*닉네임을 입력해주세요.";
const ERROR_LENGTH = "*닉네임은 최대 11자까지 가능합니다.";
const ERROR_DUPLICATE = "*중복된 닉네임입니다.";

let originalNickname = "";

/** 현재 로그인 유저 가져오기 */
const getCurrentUser = () => getStoredUser();

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

/** PATCH /api/users/me/{userId} 요청 */
const requestUserUpdate = async ({ nickname, profileImageUrl }) => {
  const user = requireAuthUser();
  if (!user) {
    throw new Error("로그인이 필요합니다. 다시 로그인해주세요.");
  }

  const updated = await updateUserProfileApi({
    userId: user.id,
    nickname: nickname.trim(),
    profileImageUrl: DEFAULT_PROFILE_IMAGE,
  });

  const sanitized = {
    ...updated,
    profileImageUrl: DEFAULT_PROFILE_IMAGE,
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

/** 회원탈퇴 모달 열기/닫기 */
const openUserDeleteModal = (modal) => modal?.classList.add("active");
const closeUserDeleteModal = (modal) => modal?.classList.remove("active");

/** 버튼 활성화 체크 */
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
  profileImageEl.src = DEFAULT_PROFILE_IMAGE;

  profileImageBtn?.addEventListener("click", () => profileImageInput?.click());
  profileImageInput?.addEventListener("change", () => {
    const file = profileImageInput.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    profileImageEl.src = previewUrl;
  });

  originalNickname = user.nickname || "";
  nicknameInput.value = originalNickname;
  nicknameInput.dataset.valid = "true";
  submitBtn.disabled = true;
  submitBtn.classList.remove("active");
  if (nicknameErrorEl) nicknameErrorEl.textContent = "";

  nicknameInput.addEventListener("input", () => {
    if (nicknameErrorEl) nicknameErrorEl.textContent = "";
    nicknameInput.dataset.valid = "false";
    updateSubmitButtonState({ nicknameInput, submitBtn });
  });

  nicknameInput.addEventListener("blur", async () => {
    const value = nicknameInput.value;
    const basicMsg = validateNickname(value);

    nicknameInput.dataset.valid = "false";

    if (nicknameErrorEl) nicknameErrorEl.textContent = basicMsg;

    if (basicMsg) {
      updateSubmitButtonState({ nicknameInput, submitBtn });
      return;
    }

    const trimmed = value.trim();

    // 기존 닉네임과 같으면 중복 체크 스킵
    if (trimmed === originalNickname) {
      if (nicknameErrorEl) nicknameErrorEl.textContent = "";
      nicknameInput.dataset.valid = "true";
      updateSubmitButtonState({ nicknameInput, submitBtn });
      return;
    }

    try {
      const { nicknameAvailable } = await checkAvailability({
        nickname: trimmed,
      });

      if (!nicknameAvailable) {
        if (nicknameErrorEl) nicknameErrorEl.textContent = ERROR_DUPLICATE;
        nicknameInput.dataset.valid = "false";
      } else {
        if (nicknameErrorEl) nicknameErrorEl.textContent = "";
        nicknameInput.dataset.valid = "true";
      }
    } catch (e) {
      if (nicknameErrorEl) nicknameErrorEl.textContent = e.message;
      nicknameInput.dataset.valid = "false";
    }

    updateSubmitButtonState({ nicknameInput, submitBtn });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const value = nicknameInput.value;
    const basicMsg = validateNickname(value);

    if (nicknameErrorEl) nicknameErrorEl.textContent = basicMsg;

    if (basicMsg) {
      nicknameInput.dataset.valid = "false";
      updateSubmitButtonState({ nicknameInput, submitBtn });
      return;
    }

    if (
      value.trim() !== originalNickname &&
      nicknameInput.dataset.valid !== "true"
    ) {
      try {
        const { nicknameAvailable } = await checkAvailability({
          nickname: value.trim(),
        });

        if (!nicknameAvailable) {
          if (nicknameErrorEl) nicknameErrorEl.textContent = ERROR_DUPLICATE;
          nicknameInput.dataset.valid = "false";
          updateSubmitButtonState({ nicknameInput, submitBtn });
          return;
        } else {
          if (nicknameErrorEl) nicknameErrorEl.textContent = "";
          nicknameInput.dataset.valid = "true";
        }
      } catch (e2) {
        if (nicknameErrorEl) nicknameErrorEl.textContent = e2.message;
        nicknameInput.dataset.valid = "false";
        updateSubmitButtonState({ nicknameInput, submitBtn });
        return;
      }
    }

    if (nicknameInput.dataset.valid !== "true") {
      updateSubmitButtonState({ nicknameInput, submitBtn });
      return;
    }

    submitBtn.disabled = true;

    try {
      await requestUserUpdate({
        nickname: value,
        profileImageUrl: profileImageEl.src,
      });
      showToast(toastEl);
      updateSubmitButtonState({ nicknameInput, submitBtn });
    } catch (err) {
      alert(err.message || "회원정보 수정 중 오류가 발생했습니다.");
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ===== 회원탈퇴 =====
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
