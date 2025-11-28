import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      // 유저 정보와 어세스 토큰 저장
      login: (userData, token) =>
        set({
          user: userData,
          accessToken: token,
          isAuthenticated: true,
        }),

      // 로그아웃
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      // 회원 정보 수정시
      updateUser: (userData) => set({ user: userData }),
    }),
    {
      name: "auth-storage", 
      storage: createJSONStorage(() => sessionStorage), // 창 끄면 사라짐
    }
  )
);
