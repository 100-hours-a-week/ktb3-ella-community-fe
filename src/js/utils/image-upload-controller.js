// import {
//   requestPresignedUpload,
//   uploadFileWithPresignedUrl,
// } from "../../features/posts/services/upload.js";

// const noop = () => {};

// export const createImageUploadController = ({
//   inputEl,
//   previewEl,
//   defaultPreview,
//   onError = noop,
//   onPreviewStateChange = noop,
// } = {}) => {
//   let uploadedUrl = "";
//   let pendingFile = null;
//   let presignedData = null;
//   let previewObjectUrl = null;
//   const fallbackPreview =
//     defaultPreview !== undefined
//       ? defaultPreview
//       : previewEl?.getAttribute("src") || "";

//   const applyPreview = (src) => {
//     if (!previewEl) {
//       onPreviewStateChange(Boolean(src));
//       return;
//     }

//     if (src) {
//       previewEl.src = src;
//       previewEl.style.display = "";
//       onPreviewStateChange(true);
//     } else {
//       previewEl.removeAttribute("src");
//       previewEl.style.display = "none";
//       onPreviewStateChange(false);
//     }
//   };

//   const revokePreviewObjectUrl = () => {
//     if (previewObjectUrl) {
//       URL.revokeObjectURL(previewObjectUrl);
//       previewObjectUrl = null;
//     }
//   };

//   const resetPreview = () => {
//     revokePreviewObjectUrl();
//     const src = uploadedUrl || fallbackPreview || "";
//     applyPreview(src);
//   };

//   const openFilePicker = () => {
//     inputEl?.click();
//   };

//   const setUploadedUrl = (url) => {
//     uploadedUrl = url || "";
//     pendingFile = null;
//     presignedData = null;
//     resetPreview();
//   };

//   const handleFileChange = async () => {
//     if (!inputEl) return;
//     const file = inputEl.files?.[0] || null;
//     pendingFile = file;
//     presignedData = null;
//     revokePreviewObjectUrl();

//     if (!file) {
//       resetPreview();
//       return;
//     }

//     previewObjectUrl = URL.createObjectURL(file);
//     applyPreview(previewObjectUrl);

//     try {
//       presignedData = await requestPresignedUpload({ file });
//     } catch (error) {
//       pendingFile = null;
//       presignedData = null;
//       resetPreview();
//       onError(error);
//     }
//   };

//   const ensureUploaded = async () => {
//     if (!pendingFile) {
//       return uploadedUrl || "";
//     }

//     if (!presignedData) {
//       throw new Error("이미지 업로드를 준비할 수 없습니다. 다시 선택해주세요.");
//     }

//     const { url } = await uploadFileWithPresignedUrl({
//       file: pendingFile,
//       presignedData,
//     });
//     setUploadedUrl(url || uploadedUrl || "");
//     return uploadedUrl || "";
//   };

//   const getCurrentUrl = () => uploadedUrl || "";

//   resetPreview();

//   return {
//     openFilePicker,
//     handleFileChange,
//     ensureUploaded,
//     setUploadedUrl,
//     getCurrentUrl,
//     resetPreview,
//   };
// };
