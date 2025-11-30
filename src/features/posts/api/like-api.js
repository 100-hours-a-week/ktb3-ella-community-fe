import { apiRequest, unwrapData } from "@/shared/api/http-client.js";
const POSTS_ENDPOINT = "/api/posts";

// 게시글 좋아요 
export const likePost = async (postId) => {
  const result = await apiRequest(`${POSTS_ENDPOINT}/${postId}/likes`, {
    method: "POST",
    defaultErrorMessage: "좋아요 처리에 실패했습니다.",
  });
  return unwrapData(result);
};

// 게시글 좋아요 취소
export const unlikePost = async (postId) => {
  const result = await apiRequest(`${POSTS_ENDPOINT}/${postId}/likes`, {
    method: "DELETE",
    defaultErrorMessage: "좋아요 취소에 실패했습니다.",
  });
  return unwrapData(result);
};
