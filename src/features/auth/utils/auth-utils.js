const NO_AUTH_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/users/availability",
  "/api/uploads/presigned-url",
];

/**
 * 주어진 엔드포인트에 인증이 필요한지 확인
 * @param {string} endpoint
 * @returns {boolean}
 */
export const isAuthRequired = (endpoint) => {
  if (!endpoint) return true;

  return !NO_AUTH_ENDPOINTS.some((path) => endpoint.startsWith(path));
};

/**
 * 쿠키에서 CSRF 토큰을 추출
 * @returns {string | null}
 */
export const getCsrfToken = () => {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? match[1] : null;
};

/**
 * Authorization 헤더와 CSRF 헤더를 생성
 * @param {string} endpoint
 * @param {string | null} csrfToken
 * @param {string | null} accessToken
 * @returns {Object}
 */
export const buildAuthAndCsrfHeaders = (endpoint, csrfToken, accessToken) => {
  const headers = {};

  // JWT Access Token 추가
  if (accessToken && isAuthRequired(endpoint)) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // CSRF 토큰 추가
  if (csrfToken) {
    headers["X-XSRF-TOKEN"] = csrfToken;
  }

  return headers;
};
