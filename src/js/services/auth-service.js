import {
  apiRequest,
  registerRefreshHandler,
  setAccessToken,
  unwrapData,
} from "./httpClient.js";

const LOGIN_ENDPOINT = "/api/auth/login";
const SIGNUP_ENDPOINT = "/api/auth/signup";
const REFRESH_ENDPOINT = "/api/auth/refresh";
const LOGOUT_ENDPOINT = "/api/auth/logout";

export const requestLogin = async ({ email, password }) => {
  const result = await apiRequest(LOGIN_ENDPOINT, {
    method: "POST",
    body: { email, password },
    defaultErrorMessage: "로그인에 실패했습니다.",
  });
  return unwrapData(result);
};

export const requestSignup = async (payload) => {
  const result = await apiRequest(SIGNUP_ENDPOINT, {
    method: "POST",
    body: payload,
    defaultErrorMessage: "회원가입에 실패했습니다.",
  });
  return unwrapData(result);
};

export const requestRefresh = async () => {
  const result = await apiRequest(REFRESH_ENDPOINT, {
    method: "POST",
    defaultErrorMessage: "토큰 갱신 실패",
  });
  return unwrapData(result);
};

export const requestLogout = async () => {
  await apiRequest(LOGOUT_ENDPOINT, {
    method: "POST",
    expectJson: false,
    defaultErrorMessage: "로그아웃 실패",
  });
  setAccessToken(null);
};

registerRefreshHandler(requestRefresh);
