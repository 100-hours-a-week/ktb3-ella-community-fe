"use strict";

const USER_STORAGE_KEY = "ktb3-community:user";

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("사용자 정보를 불러오지 못했습니다.", error);
    return null;
  }
};

export const saveStoredUser = (user) => {
  if (!user) return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("사용자 정보를 저장하지 못했습니다.", error);
  }
};

export const clearStoredUser = () => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.warn("사용자 정보를 삭제하지 못했습니다.", error);
  }
};

export const requireAuthUser = () => {
  const user = getStoredUser();
  if (!user || !user.id) {
    alert("로그인이 필요합니다.");
    window.location.href = "./login.html";
    return null;
  }
  return user;
};
