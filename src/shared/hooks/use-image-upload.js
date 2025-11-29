import { useState, useEffect, useCallback } from "react";

import {
  requestPresignedUpload,
  uploadFileWithPresignedUrl,
} from "@/shared/api/upload.js";

export const useImageUpload = (initialUrl = "") => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (file) return;

    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return initialUrl || "";
    });
  }, [initialUrl, file]);

  // 파일 선택 핸들러

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;
    // 이전 미리보기 url 있다면 메모리 해제
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);

    // 미리보기 url 생성
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  // 업로드 실행 함수
  const upload = useCallback(async () => {
    // 새로 선택한 파일이 없으면 기존 url 반환
    if (!file) return initialUrl;

    setIsUploading(true);
    try {
      const presignedData = await requestPresignedUpload({ file });

      const { url } = await uploadFileWithPresignedUrl({
        file,
        presignedData,
      });

      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setFile(null);
      setPreviewUrl(url);

      return url;
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [file, initialUrl, previewUrl]);

  // 컴포넌트가 사라질 때 미리보기 URL 메모리 해제
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return {
    previewUrl,
    handleFileChange,
    upload,
    isUploading,
    file,
  };
};
