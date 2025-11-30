import axios from "axios";

import { ApiError } from "@/shared/utils/api-error";

import {
  isAuthRequired,
  buildAuthAndCsrfHeaders,
  getCsrfToken,
} from "@/features/auth/utils/auth-utils.js";

import { useAuthStore } from "@/shared/stores/use-auth-store";

const REFRESH_ENDPOINT = "/api/auth/refresh";

let isRefreshing = false;
let refreshSubscribers = [];

const processRefreshQueue = (error, newAccessToken) => {
  refreshSubscribers.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(newAccessToken);
  });
  refreshSubscribers = [];
};

const enqueueRefreshRequest = () =>
  new Promise((resolve, reject) => {
    refreshSubscribers.push({ resolve, reject });
  });

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

      // 이미 갱신 중이면 큐에 적재
     if (isRefreshing) {
        try {
          const newAccessToken = await new Promise((resolve, reject) => {
            refreshSubscribers.push({ resolve, reject });
          });
          // 새 토큰으로 헤더 교체 후 재요청
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (err) {
          // 대기 중 에러 발생 시 
          return Promise.reject(err);
        }
      }

      // 갱신 시작
      originalRequest._retry = true;
      isRefreshing = true;
      console.log("어세스 토큰 만료, 리프레시 시도 중...");

      try {
        const { data } = await axios.post(
          REFRESH_ENDPOINT,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data?.data?.accessToken || data?.accessToken;

        if (!newAccessToken) {
          throw new Error("리프레시 응답에 accessToken이 없습니다.");
        }

        // 스토어 업데이트
        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().login(currentUser, newAccessToken);

        console.log("토큰 갱신 성공 재요청합니다.");

        processRefreshQueue(null, newAccessToken);

        // 재요청 헤더 교체
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("리프레시 요청 실패", refreshError);
        useAuthStore.getState().logout();
        processRefreshQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
