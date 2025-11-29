import { apiRequest, unwrapData } from "@/shared/api/http-client";

const LOGIN_ENDPOINT = "/api/auth/login";
const SIGNUP_ENDPOINT = "/api/auth/signup";
const LOGOUT_ENDPOINT = "/api/auth/logout";

// 로그인 요청
export const requestLogin = async ({ email, password }) => {
  const result = await apiRequest(LOGIN_ENDPOINT, {
    method: "POST",
    data: { email, password },
    defaultErrorMessage: "로그인에 실패했습니다.",
  });
  return unwrapData(result);
};

// 회원가입 요청
export const requestSignup = async (payload) => {
  const result = await apiRequest(SIGNUP_ENDPOINT, {
    method: "POST",
    data: payload,
    defaultErrorMessage: "회원가입에 실패했습니다.",
  });
  return unwrapData(result);
};

// 로그아웃 요청
export const requestLogout = async () => {
  await apiRequest(LOGOUT_ENDPOINT, {
    method: "POST",
    defaultErrorMessage: "로그아웃 실패",
  });
};
