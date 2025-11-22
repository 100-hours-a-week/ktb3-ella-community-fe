import {
  ApiError,
  apiRequest,
  toQueryString,
  unwrapData,
} from "./http-client.js";

const POSTS_ENDPOINT = "/api/posts";
const COMMENTS_ENDPOINT = "/api/comments";

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

export const fetchPostDetail = async ({ postId }) => {
  const result = await apiRequest(`${POSTS_ENDPOINT}/${postId}`, {
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

export const createPost = async ({ payload }) => {
  const result = await apiRequest(`${POSTS_ENDPOINT}`, {
    method: "POST",
    body: payload,
    parseErrorMessage: "서버 응답을 처리할 수 없습니다.",
    defaultErrorMessage: "게시글 생성에 실패했습니다.",
  });
  return unwrapData(result);
};

export const updatePost = async ({ postId, payload }) => {
  try {
    const result = await apiRequest(`${POSTS_ENDPOINT}/${postId}`, {
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

export const deletePost = async ({ postId }) => {
  try {
    await apiRequest(`${POSTS_ENDPOINT}/${postId}`, {
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

export const likePost = async ({ postId }) => {
  await apiRequest(`${POSTS_ENDPOINT}/${postId}/likes`, {
    method: "POST",
    expectJson: false,
    defaultErrorMessage: "좋아요 요청에 실패했습니다.",
  });
};

export const unlikePost = async ({ postId }) => {
  await apiRequest(`${POSTS_ENDPOINT}/${postId}/likes`, {
    method: "DELETE",
    expectJson: false,
    defaultErrorMessage: "좋아요 취소에 실패했습니다.",
  });
};

export const createComment = async ({ postId, content }) => {
  const result = await apiRequest(
    `${POSTS_ENDPOINT}/${postId}/comments`,
    {
      method: "POST",
      body: { content },
      parseErrorMessage: "댓글 처리 응답을 해석할 수 없습니다.",
      defaultErrorMessage: "댓글 등록에 실패했습니다.",
    }
  );
  return unwrapData(result);
};

export const updateComment = async ({ commentId, content }) => {
  try {
    const result = await apiRequest(
      `${COMMENTS_ENDPOINT}/${commentId}`,
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

export const deleteComment = async ({ commentId }) => {
  try {
    await apiRequest(`${COMMENTS_ENDPOINT}/${commentId}`, {
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
