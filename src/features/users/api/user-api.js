import { apiRequest, unwrapData } from "@/shared/api/http-client.js";
import { ApiError } from "@/shared/utils/api-error.js";

const AVAILABILITY_ENDPOINT = "/api/users/availability";
const USERS_ENDPOINT = "/api/users";
const PASSWORD_ENDPOINT = "/api/users/me/password";
const PROFILE_IMAGE_UPLOAD_ENDPOINT = "/api/users/upload-image";

export const fetchMe = async (accessToken = null) => {
  const options = {
    method: "GET",
    defaultErrorMessage: "사용자 정보를 불러오지 못했습니다.",
  };
  // 인자로 accessToken이 들어왔다면, 헤더에 직접 추가하여 요청
  if (accessToken) {
    options.headers = {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  const result = await apiRequest(`${USERS_ENDPOINT}/me`, options);
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
    data: { nickname, profileImageUrl },
    defaultErrorMessage: "회원정보 수정에 실패했습니다.",
  });
  return unwrapData(result);
};

export const deleteCurrentUser = async () => {
  await apiRequest(`${USERS_ENDPOINT}/me`, {
    method: "DELETE",
    defaultErrorMessage: "회원 탈퇴에 실패했습니다.",
  });
};

export const updateUserPassword = async ({ newPassword }) => {
  await apiRequest(PASSWORD_ENDPOINT, {
    method: "POST",
    data: { newPassword },
    defaultErrorMessage: "비밀번호 수정에 실패했습니다.",
  });
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const result = await apiRequest(PROFILE_IMAGE_UPLOAD_ENDPOINT, {
    method: "POST",
    data: formData,
    defaultErrorMessage: "이미지 업로드에 실패했습니다.",
  });
  return unwrapData(result);
};
