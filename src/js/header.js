import {
  clearStoredUser,
  getStoredUser,
  saveStoredUser,
} from "./utils/user.js";
import {
  fetchMe,
  getAccessToken,
  hydrateAccessToken,
  requestLogout,
  requestRefresh,
  setAccessToken,
} from "./services/api.js";

import { isAuthRequired } from "./utils/auth.js";

const updateDropdownAvatars = (src) => {
  const finalSrc = src;
  document
    .querySelectorAll(".profile-dropdown-toggle img")
    .forEach((avatarImg) => {
      if (!avatarImg) {
        console.error("프로필 이미지 요소를 찾을 수 없습니다.");
        return;
      }
      avatarImg.classList.remove("is-loaded");
      avatarImg.addEventListener(
        "load",
        () => avatarImg.classList.add("is-loaded"),
        { once: true }
      );
      avatarImg.src = finalSrc || "";
    });
};

const closeAllDropdowns = (exclude) => {
  document.querySelectorAll(".profile-dropdown").forEach((dropdown) => {
    if (dropdown === exclude) return;
    dropdown.classList.remove("open");
    const toggle = dropdown.querySelector(".profile-dropdown-toggle");
    toggle?.setAttribute("aria-expanded", "false");
  });
};

const initProfileDropdowns = () => {
  const dropdowns = document.querySelectorAll(".profile-dropdown");
  if (!dropdowns.length) return;

  const currentUser = getStoredUser();
  if (currentUser?.profileImageUrl) {
    updateDropdownAvatars(currentUser.profileImageUrl);
  } else {
    updateDropdownAvatars();
  }

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".profile-dropdown-toggle");
    const menu = dropdown.querySelector(".profile-dropdown-menu");
    const logoutBtn = dropdown.querySelector(".profile-dropdown-logout");

    if (!toggle || !menu) return;

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = dropdown.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        closeAllDropdowns(dropdown);
      }
    });

    logoutBtn?.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await requestLogout(); // 백엔드 쿠키 삭제 요청
      } catch (e) {
        console.error("로그아웃 오류", e);
      }
      clearStoredUser(); // 로컬 유저 정보 삭제
      window.location.href = "./login.html";
    });

    menu.addEventListener("click", (event) => event.stopPropagation());
  });

  document.addEventListener("click", () => closeAllDropdowns());
};

let authInitPromise = null;
const runAuth = async () => {
  // 1. 먼저 로컬에 저장된 유저 정보가 있으면 UI 먼저 그림
  const storedUser = getStoredUser();
  if (storedUser?.profileImageUrl) {
    updateDropdownAvatars(storedUser.profileImageUrl);
  } else {
    updateDropdownAvatars();
  }

  // 로그인 페이지나 회원가입 페이지에서는 Refresh 시도 불필요
  const path = window.location.pathname;
  if (path.includes("login.html") || path.includes("signup.html")) {
    return;
  }

  try {
    // 세션스토리지에 토큰 있으면 재사용, 없으면 리프레시
    hydrateAccessToken();
    let accessToken = getAccessToken();
    if (!accessToken) {
      const refreshed = await requestRefresh();
      accessToken = refreshed?.accessToken;
      setAccessToken(accessToken);
    }

    // 최신 유저 정보 다시 받아오기
    const userData = await fetchMe();
    saveStoredUser(userData);
    updateDropdownAvatars(userData.profileImageUrl);
  } catch (error) {
    // 갱신 실패 시 로컬 유저 정보도 삭제
    clearStoredUser();
    updateDropdownAvatars();

    if (isAuthRequired(path)) window.location.href = "./login.html";
  }
};

export const initAuth = () => {
  if (!authInitPromise) {
    authInitPromise = runAuth();
  }
  return authInitPromise;
};

// 헤더 초기화 함수
export const initHeader = () => {
  initProfileDropdowns();
  return initAuth();
};

window.addEventListener("user:profile-updated", (event) => {
  const newUrl = event.detail?.profileImageUrl;
  updateDropdownAvatars(newUrl);
});

export const getAuthReady = () => authInitPromise || Promise.resolve();
