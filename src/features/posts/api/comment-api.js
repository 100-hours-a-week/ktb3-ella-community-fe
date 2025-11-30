import { apiRequest, unwrapData } from "@/shared/api/http-client.js";
const POSTS_ENDPOINT = "/api/posts";
const COMMENTS_ENDPOINT = "/api/comments";

// 목록 조회
export const getComments = async ({ postId, page }) => {
  const response = await apiRequest(`${POSTS_ENDPOINT}/${postId}/comments`, {
    method: "GET",
    params: { page },
    defaultErrorMessage: "댓글을 불러오는데 실패했습니다.",
  });
  return unwrapData(response);
};

// 댓글 작성
export const createComment = async ({ postId, content }) => {
  const response = await apiRequest(`${POSTS_ENDPOINT}/${postId}/comments`, {
    method: "POST",
    data: { content },
    defaultErrorMessage: "댓글 작성을 실패했습니다.",
  });
  return unwrapData(response);
};

// 댓글 수정
export const updateComment = async ({ commentId, content }) => {
  const response = await apiRequest(`${COMMENTS_ENDPOINT}/${commentId}`, {
    method: "PUT",
    data: { content },
    defaultErrorMessage: "댓글 수정에 실패했습니다.",
  });
  return unwrapData(response);
};

// 댓글 삭제
export const deleteComment = async ({ commentId }) => {
  const response = await apiRequest(`${COMMENTS_ENDPOINT}/${commentId}`, {
    method: "DELETE",
    defaultErrorMessage: "댓글 삭제에 실패했습니다.",
  });
  return unwrapData(response);
};
