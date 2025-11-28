import { apiRequest, unwrapData } from "@/shared/api/http-client.js";
const POSTS_ENDPOINT = "/api/posts";

export const likePost = async (postId) => {
  const result = await apiRequest(`${POSTS_ENDPOINT}/${postId}/likes`, {
    method: "POST",
    defaultErrorMessage: "좋아요 처리에 실패했습니다.",
  });
  return unwrapData(result);
};

export const unlikePost = async (postId) => {
  const result = await apiRequest(`${POSTS_ENDPOINT}/${postId}/likes`, {
    method: "DELETE",
    defaultErrorMessage: "좋아요 취소에 실패했습니다.",
  });
  return unwrapData(result);
};
