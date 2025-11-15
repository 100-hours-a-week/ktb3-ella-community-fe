const DEFAULT_HEADERS = {
  Accept: "*/*",
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

const buildRequestOptions = ({ method = "GET", headers = {}, body } = {}) => {
  const mergedHeaders = { ...DEFAULT_HEADERS, ...headers };
  const options = {
    method,
    headers: mergedHeaders,
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

const toQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      Number.isNaN(value)
    ) {
      return;
    }
    query.append(key, value);
  });
  return query.toString();
};

const unwrapData = (result) => {
  if (result && typeof result === "object" && "data" in result) {
    return result.data;
  }
  return result;
};

export const apiRequest = async (endpoint, options = {}) => {
  const {
    defaultErrorMessage,
    expectJson = true,
    parseErrorMessage,
    ...fetchOptions
  } = options;

  const response = await fetch(endpoint, buildRequestOptions(fetchOptions));
  const data = await parseJsonBody(response, { expectJson, parseErrorMessage });

  if (!response.ok) {
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

const LOGIN_ENDPOINT = "/api/auth/login";
const SIGNUP_ENDPOINT = "/api/auth/signup";
const POSTS_ENDPOINT = "/api/posts";
const COMMENTS_ENDPOINT = "/api/comments";
const AVAILABILITY_ENDPOINT = "/api/users/availability";
const USERS_ENDPOINT = "/api/users";
const PASSWORD_ENDPOINT = "/api/users/me/password";
const UPLOADS_ENDPOINT = "/api/uploads";

export const requestLogin = async ({ email, password }) => {
  try {
    const result = await apiRequest(LOGIN_ENDPOINT, {
      method: "POST",
      body: { email, password },
      parseErrorMessage: "서버 응답을 처리할 수 없습니다.",
      defaultErrorMessage: "*로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
    });
    return unwrapData(result);
  } catch (error) {
    if (error instanceof ApiError && error.code === "USER_NOT_FOUND") {
      throw new ApiError("*아이디 또는 비밀번호를 확인해주세요.", {
        status: error.status,
        code: error.code,
        data: error.data,
      });
    }
    throw error;
  }
};

export const requestSignup = async ({
  email,
  password,
  nickname,
  profileImageUrl,
}) => {
  const result = await apiRequest(SIGNUP_ENDPOINT, {
    method: "POST",
    body: { email, password, nickname, profileImageUrl },
    parseErrorMessage: "회원가입 응답을 처리할 수 없습니다.",
    defaultErrorMessage: "회원가입에 실패했습니다.",
  });
  return unwrapData(result);
};

export const checkAvailability = async (params) => {
  const query = toQueryString(params);
  const result = await apiRequest(
    `${AVAILABILITY_ENDPOINT}?${query}`,
    {
      method: "GET",
      parseErrorMessage: "중복 확인 응답을 처리할 수 없습니다.",
      defaultErrorMessage: "중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.",
    }
  );

  if (!result?.data) {
    throw new ApiError("중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  return result.data;
};

export const fetchPostList = async ({
  page = 1,
  pageSize = 10,
  sort = "NEW",
} = {}) => {
  const query = toQueryString({ page, pageSize, sort });
  const result = await apiRequest(`${POSTS_ENDPOINT}?${query}`, {
    method: "GET",
    defaultErrorMessage: "게시글 목록을 불러오지 못했습니다.",
  });
  return unwrapData(result);
};

export const fetchPostDetail = async ({ postId, userId = 0 }) => {
  const result = await apiRequest(`${POSTS_ENDPOINT}/${postId}/${userId}`, {
    method: "GET",
    defaultErrorMessage: "게시글 정보를 불러오지 못했습니다.",
  });
  return unwrapData(result);
};

export const fetchCommentsPage = async ({ postId, page = 1 }) => {
  const query = toQueryString({ page });
  const result = await apiRequest(
    `${POSTS_ENDPOINT}/${postId}/comments?${query}`,
    {
      method: "GET",
      defaultErrorMessage: "댓글을 불러오지 못했습니다.",
    }
  );
  return unwrapData(result);
};

export const createPost = async ({ userId, payload }) => {
  const result = await apiRequest(`${POSTS_ENDPOINT}/${userId}`, {
    method: "POST",
    body: payload,
    parseErrorMessage: "서버 응답을 처리할 수 없습니다.",
    defaultErrorMessage: "*게시글 생성에 실패했습니다.",
  });
  return unwrapData(result);
};

export const updatePost = async ({ postId, userId, payload }) => {
  try {
    const result = await apiRequest(`${POSTS_ENDPOINT}/${postId}/${userId}`, {
      method: "PUT",
      body: payload,
      parseErrorMessage: "서버 응답을 처리할 수 없습니다.",
      defaultErrorMessage: "게시글 수정에 실패했습니다.",
    });
    return unwrapData(result);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw new ApiError("게시글 수정 권한이 없습니다.", {
        status: error.status,
        data: error.data,
        code: error.code,
      });
    }
    throw error;
  }
};

export const deletePost = async ({ postId, userId }) => {
  try {
    await apiRequest(`${POSTS_ENDPOINT}/${postId}/${userId}`, {
      method: "DELETE",
      expectJson: false,
      defaultErrorMessage: "게시글 삭제에 실패했습니다.",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw new ApiError("게시글 삭제 권한이 없습니다.", {
        status: error.status,
        code: error.code,
        data: error.data,
      });
    }
    throw error;
  }
};

export const likePost = async ({ postId, userId }) => {
  await apiRequest(`${POSTS_ENDPOINT}/${postId}/likes/${userId}`, {
    method: "POST",
    expectJson: false,
    defaultErrorMessage: "좋아요 요청에 실패했습니다.",
  });
};

export const unlikePost = async ({ postId, userId }) => {
  await apiRequest(`${POSTS_ENDPOINT}/${postId}/likes/${userId}`, {
    method: "DELETE",
    expectJson: false,
    defaultErrorMessage: "좋아요 취소에 실패했습니다.",
  });
};

export const createComment = async ({ postId, userId, content }) => {
  const result = await apiRequest(
    `${POSTS_ENDPOINT}/${postId}/comments/${userId}`,
    {
      method: "POST",
      body: { content },
      parseErrorMessage: "댓글 처리 응답을 해석할 수 없습니다.",
      defaultErrorMessage: "댓글 등록에 실패했습니다.",
    }
  );
  return unwrapData(result);
};

export const updateComment = async ({ commentId, userId, content }) => {
  try {
    const result = await apiRequest(
      `${COMMENTS_ENDPOINT}/${commentId}/${userId}`,
      {
        method: "PUT",
        body: { content },
        parseErrorMessage: "댓글 처리 응답을 해석할 수 없습니다.",
        defaultErrorMessage: "댓글 수정에 실패했습니다.",
      }
    );
    return unwrapData(result);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw new ApiError("댓글 수정 권한이 없습니다.", {
        status: error.status,
        code: error.code,
        data: error.data,
      });
    }
    throw error;
  }
};

export const deleteComment = async ({ commentId, userId }) => {
  try {
    await apiRequest(`${COMMENTS_ENDPOINT}/${commentId}/${userId}`, {
      method: "DELETE",
      expectJson: false,
      defaultErrorMessage: "댓글 삭제에 실패했습니다.",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw new ApiError("댓글 삭제 권한이 없습니다.", {
        status: error.status,
        code: error.code,
        data: error.data,
      });
    }
    throw error;
  }
};

export const updateUserProfile = async ({
  userId,
  nickname,
  profileImageUrl,
}) => {
  const result = await apiRequest(`${USERS_ENDPOINT}/me/${userId}`, {
    method: "PATCH",
    body: { nickname, profileImageUrl },
    parseErrorMessage: "회원정보 수정 응답을 처리할 수 없습니다.",
    defaultErrorMessage: "회원정보 수정에 실패했습니다.",
  });
  return unwrapData(result);
};

export const deleteCurrentUser = async ({ userId }) => {
  await apiRequest(`${USERS_ENDPOINT}/me/${userId}`, {
    method: "DELETE",
    expectJson: false,
    defaultErrorMessage: "회원 탈퇴에 실패했습니다.",
  });
};

export const updateUserPassword = async ({ userId, newPassword }) => {
  await apiRequest(`${PASSWORD_ENDPOINT}/${encodeURIComponent(userId)}`, {
    method: "POST",
    body: { newPassword },
    expectJson: false,
    defaultErrorMessage: "비밀번호 수정에 실패했습니다.",
  });
};

export const requestPresignedUploadUrl = async ({ fileName, contentType }) => {
  const query = toQueryString({ fileName, contentType });
  const result = await apiRequest(
    `${UPLOADS_ENDPOINT}/presigned-url?${query}`,
    {
      method: "GET",
      defaultErrorMessage: "presigned url 발급에 실패했습니다.",
    }
  );
  return unwrapData(result);
};
