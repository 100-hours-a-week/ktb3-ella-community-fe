import {
  apiRequest,
  toQueryString,
  unwrapData,
} from "@/services/http-client.js";

const UPLOADS_ENDPOINT = "/api/uploads";

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
