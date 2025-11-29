const NO_AUTH_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
];

/**
 * 주어진 엔드포인트에 인증(Access Token)이 필요한지 확인
 * @param {string} endpoint 
 * @returns {boolean} 
 */
export const isAuthRequired = (endpoint) => {
  return !NO_AUTH_ENDPOINTS.some((path) => endpoint.includes(path));
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

  // JWT Access Token (Authorization) 헤더 추가
  if (isAuthRequired(endpoint) && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // CSRF (X-XSRF-TOKEN) 헤더 추가
  if (csrfToken) {
    headers["X-XSRF-TOKEN"] = csrfToken;
  }

  return headers;
};

/**
 * 쿠키에서 CSRF 토큰을 추출
 * @returns {string | null} 
 */
export const getCsrfToken = () => {
  const name = "XSRF-TOKEN";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};
