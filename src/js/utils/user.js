const USER_STORAGE_KEY = "ktb3-community:user";

// 사용자 정보(닉네임, 프로필이미지)만 가져옵니다.
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("사용자 정보를 불러오지 못했습니다.", error);
    return null;
  }
};

// 사용자 정보를 저장합니다.
export const saveStoredUser = (user) => {
  if (!user) return;
  try {
    const normalizedUser = {
      ...user,
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
  } catch (error) {
    console.warn("사용자 정보를 저장하지 못했습니다.", error);
  }
};

// 사용자 정보를 삭제합니다. (로그아웃 시)
export const clearStoredUser = () => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.warn("사용자 정보를 삭제하지 못했습니다.", error);
  }
};
