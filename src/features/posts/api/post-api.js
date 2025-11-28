import { apiRequest, unwrapData } from "@/shared/api/http-client.js";

const POSTS_ENDPOINT = "/api/posts";

export const getPosts = async ({ page, size, sort, keyword }) => {
  const params = {
    page,
    size,
    sort,
  };

  const result = await apiRequest(POSTS_ENDPOINT, {
    method: "GET",
    params: params,
    defaultErrorMessage: "게시글 목록을 불러오지 못했습니다.",
  });

  return unwrapData(result);
};

export const getPost = async (postId) => {
  const result = await apiRequest(`${POSTS_ENDPOINT}/${postId}`, {
    method: "GET",
    defaultErrorMessage: "게시글 상세 정보를 불러오지 못했습니다.",
  });

  return unwrapData(result);
};

export const createPost = async ({ title, content, tagNames }) => {
  const result = await apiRequest(POSTS_ENDPOINT, {
    method: "POST",
    data: { title, content, tagNames },
    defaultErrorMessage: "게시글 작성에 실패했습니다.",
  });

  return unwrapData(result);
};

export const updatePost = async (postId, { title, content, tagNames }) => {
  const result = await apiRequest(`${POSTS_ENDPOINT}/${postId}`, {
    method: "PUT",
    data: { title, content, tagNames },
    defaultErrorMessage: "게시글 수정에 실패했습니다.",
  });

  return unwrapData(result);
};

export const deletePost = async (postId) => {
  await apiRequest(`${POSTS_ENDPOINT}/${postId}`, {
    method: "DELETE",
    defaultErrorMessage: "게시글 삭제에 실패했습니다.",
  });
};
