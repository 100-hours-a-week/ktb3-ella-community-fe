import { requestPresignedUploadUrl } from "./api.js";

const normalizeHeaders = (headers) => {
  if (!headers || typeof headers !== "object") {
    return {};
  }

  return Object.entries(headers).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    acc[key] = Array.isArray(value) ? value[0] : value;
    return acc;
  }, {});
};

const uploadWithPresignedUrl = async ({ uploadUrl, headers, file }) => {
  if (!uploadUrl) {
    throw new Error("업로드 URL이 유효하지 않습니다.");
  }

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers,
    body: file,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `파일 업로드에 실패했습니다. (${response.status}) ${text}`.trim()
    );
  }
};

const defaultPublicUrlResolver = ({ publicUrl, uploadUrl, key }) => {
  if (publicUrl) return publicUrl;
  if (uploadUrl) {
    const [baseUrl] = uploadUrl.split("?");
    if (baseUrl) return baseUrl;
  }
  return key || "";
};

export const requestPresignedUpload = async ({ file }) => {
  if (!file) {
    throw new Error("업로드할 파일이 없습니다.");
  }

  return requestPresignedUploadUrl({
    fileName: file.name,
    contentType: file.type || "application/octet-stream",
  });
};

export const uploadFileWithPresignedUrl = async ({
  file,
  presignedData,
  resolvePublicUrl,
} = {}) => {
  if (!file) {
    throw new Error("업로드할 파일이 없습니다.");
  }

  const presigned =
    presignedData && Object.keys(presignedData).length
      ? presignedData
      : await requestPresignedUpload({ file });

  const headers = normalizeHeaders(presigned?.headers);
  await uploadWithPresignedUrl({
    uploadUrl: presigned.uploadUrl,
    headers,
    file,
  });

  const resolver = resolvePublicUrl || defaultPublicUrlResolver;
  const url = resolver({
    publicUrl: presigned.publicUrl,
    uploadUrl: presigned.uploadUrl,
    key: presigned.key,
  });

  return {
    key: presigned.key,
    url,
  };
};
