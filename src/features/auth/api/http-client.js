import axios from "axios";
import {
  buildAuthAndCsrfHeaders,
  getCsrfToken,
  isAuthRequired,
} from "../services/auth.js";
import { clearStoredUser } from "../../users/store/user.js";

const ACCESS_TOKEN_KEY = "ktb3-community:accessToken";

// 토큰 상태 관리 
let _accessToken = null;
let refreshHandler = null;

export const setAccessToken = (token) => {
  _accessToken = token;
  try {
    if (token) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch (_) {}
};

export const getAccessToken = () => _accessToken;

export const hydrateAccessToken = () => {
  if (_accessToken) return _accessToken;
  try {
    const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      _accessToken = stored;
    }
  } catch (_) {}
  return _accessToken;
};

export const registerRefreshHandler = (handler) => {
  refreshHandler = handler;
};

// 커스텀 에러 클래스 
export class ApiError extends Error {
  constructor(message, { status, code, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const apiClient = axios.create({
  baseURL: "", 
  headers: {
    Accept: "application/json",
  },
  withCredentials: true, 
});

apiClient.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfToken();
    const authHeaders = buildAuthAndCsrfHeaders(
      config.url,
      csrfToken,
      _accessToken
    );

    // 헤더 병합
    config.headers = {
      ...config.headers, 
      ...authHeaders, 
    };

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    if (
      response?.status === 401 &&
      isAuthRequired(originalRequest.url) &&
      !originalRequest._retry &&
      refreshHandler
    ) {
      originalRequest._retry = true; 
      console.log("🔒 어세스 토큰 만료, 리프레시 시도...");

      try {
        const refreshed = await refreshHandler();
        if (refreshed?.accessToken) {
          setAccessToken(refreshed.accessToken);
          originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("리프레시 실패, 로그아웃 처리", refreshError);
        clearStoredUser();
        setAccessToken(null);
        if (!window.location.href.includes("/login")) {
        }
        return Promise.reject(refreshError);
      }
    }

    // (2) 일반 에러 처리 (ApiError 형식으로 변환)
    const message =
      response?.data?.message ||
      error.message ||
      "요청 처리 중 오류가 발생했습니다.";
    const apiError = new ApiError(message, {
      status: response?.status || 500,
      code: response?.data?.code,
      data: response?.data,
    });

    return Promise.reject(apiError);
  }
);

export const unwrapData = (result) => {
  if (result && typeof result === "object" && "data" in result) {
    return result.data;
  }
  return result;
};
export const apiRequest = async (endpoint, options = {}) => {
  const {
    defaultErrorMessage,
    method = "GET",
    body, 
    params,
    ...customConfig
  } = options;

  try {
    const response = await apiClient({
      url: endpoint,
      method,
      data: body, 
      params: params,
      ...customConfig,
    });

    return response.data; 
  } catch (error) {
    if (defaultErrorMessage && error instanceof ApiError) {
    }
    throw error;
  }
};
