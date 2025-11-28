import axios from "axios";

import { ApiError } from "@/shared/utils/api-error";

import {
  isAuthRequired,
  buildAuthAndCsrfHeaders,
  getCsrfToken,
} from "@/features/auth/utils/auth-utils.js";

import { useAuthStore } from "@/shared/stores/use-auth-store";

const REFRESH_ENDPOINT = "/api/auth/refresh";

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터 헤더 주입
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;

    const csrfToken = getCsrfToken();

    const authHeaders = buildAuthAndCsrfHeaders(
      config.url,
      csrfToken,
      accessToken
    );

    config.headers = {
      ...config.headers,
      ...authHeaders,
    };

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 토큰 갱신 및 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    // 401 에러 발생 시 토큰 갱신 시도
    if (
      response?.status === 401 &&
      isAuthRequired(originalRequest.url) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      console.log("어세스 토큰 만료, 리프레시 시도 중...");

      try {
        const { data } = await axios.post(
          REFRESH_ENDPOINT,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data?.data?.accessToken || data?.accessToken;

        if (newAccessToken) {
          // 스토어 업데이트
          const currentUser = useAuthStore.getState().user;
          useAuthStore.getState().login(currentUser, newAccessToken);

          console.log("토큰 갱신 성공 재요청합니다.");

          // 재요청 헤더 교체
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return apiClient(originalRequest);
        } else {
          console.error(" 리프레시 응답에 accessToken이 없습니다", data);
          useAuthStore.getState().logout();
        }
      } catch (refreshError) {
        console.error("리프레시 요청 실패", refreshError);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // 에러 처리
    const message = response?.data?.message || error.message || "요청 실패";
    const apiError = new ApiError(message, {
      status: response?.status || 500,
      code: response?.data?.code,
      data: response?.data,
    });

    return Promise.reject(apiError);
  }
);

// 유틸 함수
export const unwrapData = (result) => {
  if (result && typeof result === "object" && "data" in result) {
    return result.data;
  }
  return result;
};

export const apiRequest = async (endpoint, options = {}) => {
  const { method = "GET", params, data, ...customConfig } = options;
  try {
    const response = await apiClient({
      url: endpoint,
      method,
      params,
      data,
      ...customConfig,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
