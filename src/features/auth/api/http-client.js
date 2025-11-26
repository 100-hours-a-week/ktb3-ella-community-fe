import {
  buildAuthAndCsrfHeaders,
  getCsrfToken,
  isAuthRequired,
} from "../services/auth.js";
import { clearStoredUser } from "../../users/store/user.js";

const DEFAULT_HEADERS = {
  Accept: "*/*",
};
const MAX_RETRY_COUNT = 1;
const ACCESS_TOKEN_KEY = "ktb3-community:accessToken";

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

export class ApiError extends Error {
  constructor(message, { status, code, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const buildRequestOptions = ({
  method = "GET",
  headers = {},
  body,
  credentials = "include",
} = {}) => {
  const mergedHeaders = { ...DEFAULT_HEADERS, ...headers };
  const options = {
    method,
    headers: mergedHeaders,
    credentials,
  };

  if (body !== undefined && body !== null) {
    const isFormData = body instanceof FormData;
    const isBlob = typeof Blob !== "undefined" && body instanceof Blob;
    const isJsonBody = !isFormData && !isBlob && typeof body !== "string";

    if (isJsonBody) {
      options.body = JSON.stringify(body);
      if (!mergedHeaders["Content-Type"]) {
        options.headers["Content-Type"] = "application/json";
      }
    } else {
      options.body = body;
    }
  }

  return options;
};

const parseJsonBody = async (
  response,
  { expectJson, parseErrorMessage } = {}
) => {
  if (!expectJson) return null;
  if (response.status === 204 || response.status === 205) return null;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiError(parseErrorMessage || "서버 응답을 처리할 수 없습니다.", {
      status: response.status,
    });
  }
};

export const unwrapData = (result) => {
  if (result && typeof result === "object" && "data" in result) {
    return result.data;
  }
  return result;
};

export const toQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  return query.toString();
};

export const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
  const {
    defaultErrorMessage,
    expectJson = true,
    parseErrorMessage,
    method = "GET",
    ...fetchOptions
  } = options;
  const normalizedMethod = (method || "GET").toUpperCase();

  const csrfToken = getCsrfToken();
  const authHeaders = buildAuthAndCsrfHeaders(
    endpoint,
    csrfToken,
    _accessToken
  );

  const mergedHeaders = {
    ...authHeaders,
    ...fetchOptions.headers,
  };

  const currentOptions = {
    ...fetchOptions,
    method: normalizedMethod,
    headers: mergedHeaders,
  };

  const response = await fetch(endpoint, buildRequestOptions(currentOptions));
  const data = await parseJsonBody(response, { expectJson, parseErrorMessage });

  if (!response.ok) {
    const isTokenExpired =
      response.status === 401 &&
      isAuthRequired(endpoint) &&
      retryCount < MAX_RETRY_COUNT;

    if (isTokenExpired && refreshHandler) {
      console.log("어세스 토큰 만료, 리프레시 시도 중...");
      try {
        const refreshed = await refreshHandler();
        if (refreshed?.accessToken) {
          setAccessToken(refreshed.accessToken);
        }
        return apiRequest(endpoint, options, retryCount + 1);
      } catch (refreshError) {
        console.error("리프레시 실패", refreshError);
        clearStoredUser();
        if (!window.location.href.includes("login.html")) {
          window.location.href = "/login.html";
        }
        throw refreshError;
      }
    }

    const message =
      data?.message ||
      defaultErrorMessage ||
      "요청 처리 중 오류가 발생했습니다.";
    throw new ApiError(message, {
      status: response.status,
      code: data?.code,
      data,
    });
  }

  return data;
};
