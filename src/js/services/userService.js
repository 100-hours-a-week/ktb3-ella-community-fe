import {
  ApiError,
  apiRequest,
  toQueryString,
  unwrapData,
} from "./httpClient.js";

const AVAILABILITY_ENDPOINT = "/api/users/availability";
const USERS_ENDPOINT = "/api/users";
const PASSWORD_ENDPOINT = "/api/users/me/password";

export const fetchMe = async () => {
  const result = await apiRequest(`${USERS_ENDPOINT}/me`, {
    method: "GET",
    defaultErrorMessage: "사용자 정보를 불러오지 못했습니다.",
  });
  return unwrapData(result);
};

export const checkAvailability = async (params) => {
  const query = toQueryString(params);
  const result = await apiRequest(`${AVAILABILITY_ENDPOINT}?${query}`, {
    method: "GET",
    parseErrorMessage: "중복 확인 응답을 처리할 수 없습니다.",
    defaultErrorMessage: "중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.",
  });

  if (!result?.data) {
    throw new ApiError("중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  return result.data;
};

export const updateUserProfile = async ({ nickname, profileImageUrl }) => {
  const result = await apiRequest(`${USERS_ENDPOINT}/me`, {
    method: "PATCH",
    body: { nickname, profileImageUrl },
    parseErrorMessage: "회원정보 수정 응답을 처리할 수 없습니다.",
    defaultErrorMessage: "회원정보 수정에 실패했습니다.",
  });
  return unwrapData(result);
};

export const deleteCurrentUser = async () => {
  await apiRequest(`${USERS_ENDPOINT}/me`, {
    method: "DELETE",
    expectJson: false,
    defaultErrorMessage: "회원 탈퇴에 실패했습니다.",
  });
};

export const updateUserPassword = async ({ newPassword }) => {
  await apiRequest(PASSWORD_ENDPOINT, {
    method: "POST",
    body: { newPassword },
    expectJson: false,
    defaultErrorMessage: "비밀번호 수정에 실패했습니다.",
  });
};
