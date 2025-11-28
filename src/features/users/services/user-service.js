import { apiRequest, unwrapData } from "@/shared/api/http-client.js";
import { ApiError } from "@/shared/utils/api-error.js";

const AVAILABILITY_ENDPOINT = "/api/users/availability";
const USERS_ENDPOINT = "/api/users";
const PASSWORD_ENDPOINT = "/api/users/me/password";

// 1. 내 정보 가져오기 (거의 그대로)
export const fetchMe = async () => {
  const result = await apiRequest(`${USERS_ENDPOINT}/me`, {
    method: "GET",
    defaultErrorMessage: "사용자 정보를 불러오지 못했습니다.",
  });
  return unwrapData(result);
};

export const checkAvailability = async (params) => {
  const result = await apiRequest(AVAILABILITY_ENDPOINT, {
    method: "GET",
    params: params,
    defaultErrorMessage: "중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.",
  });

  const data = unwrapData(result);

  if (!data) {
    throw new ApiError("중복 확인 데이터를 받아오지 못했습니다.");
  }

  return data;
};

export const updateUserProfile = async ({ nickname, profileImageUrl }) => {
  const result = await apiRequest(`${USERS_ENDPOINT}/me`, {
    method: "PATCH",
    body: { nickname, profileImageUrl }, // apiRequest 래퍼가 body를 data로 변환해줍니다.
    defaultErrorMessage: "회원정보 수정에 실패했습니다.",
  });
  return unwrapData(result);
};

export const deleteCurrentUser = async () => {
  await apiRequest(`${USERS_ENDPOINT}/me`, {
    method: "DELETE",
    // expectJson: false, // Axios는 응답이 없어도(204) 에러 안 나므로 삭제해도 됨
    defaultErrorMessage: "회원 탈퇴에 실패했습니다.",
  });
};

export const updateUserPassword = async ({ newPassword }) => {
  await apiRequest(PASSWORD_ENDPOINT, {
    method: "POST",
    body: { newPassword },
    defaultErrorMessage: "비밀번호 수정에 실패했습니다.",
  });
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const result = await apiRequest("/api/users/upload-image", {
    method: "POST",
    body: formData,
    defaultErrorMessage: "이미지 업로드 실패",
  });
  return unwrapData(result);
};
