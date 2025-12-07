import axios from "axios";
import { apiRequest, unwrapData } from "@/shared/api/http-client";

export const requestPresignedUpload = async ({ file }) => {
  const result = await apiRequest("/api/uploads/presigned-url", {
    method: "GET",
    params: {
      fileName: file.name,
      contentType: file.type,
    },
    defaultErrorMessage: "업로드 주소를 받아오지 못했습니다.",
  });

  return unwrapData(result);
};

export const uploadFileWithPresignedUrl = async ({ file, presignedData }) => {
  const { uploadUrl, headers } = presignedData;

  // Cache-Control 헤더
  const cacheControl = headers?.["cache-control"]?.[0];

  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
      // S3 업로드 시 캐시 설정
      ...(cacheControl && { "Cache-Control": cacheControl }),

      Authorization: undefined,
    },
  });

  return { url: uploadUrl.split("?")[0] };
};
