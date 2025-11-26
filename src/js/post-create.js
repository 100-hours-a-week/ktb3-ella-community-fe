// import { getStoredUser } from "../features/users/store/user.js";
// import { createPost } from "../features/posts/services/api.js";
// import { createImageUploadController } from "./utils/image-upload-controller.js";

// const ensureAuthUser = () => {
//   const user = getStoredUser();
//   if (!user) {
//     alert("로그인이 필요합니다.");
//     window.location.href = "./login.html";
//     return null;
//   }
//   return user;
// };

// const form = document.querySelector(".post-create");
// const titleInput = document.querySelector("#post-title");
// const contentInput = document.querySelector("#post-content");
// const submitButton = document.querySelector(".btn-post-submit");
// const contentError = document.querySelector("#post-content-error");
// const imageInput = document.querySelector("#post-image-input");
// const imageText = document.querySelector("#post-image-text");
// const imagePreview = document.querySelector(".post-image-preview");
// let imageUploader = null;

// const ERROR_MSG = "*제목, 내용을 모두 작성해주세요.";

// const isFilled = () => {
//   const title = (titleInput?.value || "").trim();
//   const content = (contentInput?.value || "").trim();
//   return !!title && !!content;
// };

// const validateForm = () => {
//   return isFilled() ? "" : ERROR_MSG;
// };

// const updateButtonState = () => {
//   if (!submitButton) return;
//   if (isFilled()) {
//     submitButton.classList.add("active");
//   } else {
//     submitButton.classList.remove("active");
//   }
// };

// const attachFieldEvents = () => {
//   titleInput?.addEventListener("input", () => {
//     updateButtonState();
//     if (isFilled() && contentError) contentError.textContent = "";
//   });

//   contentInput?.addEventListener("input", () => {
//     updateButtonState();
//     if (isFilled() && contentError) contentError.textContent = "";
//   });
// };

// const setupImageUploader = () => {
//   if (!imageInput || !imagePreview) return;

//   imageUploader = createImageUploadController({
//     inputEl: imageInput,
//     previewEl: imagePreview,
//     defaultPreview: imagePreview.dataset.placeholder || "",
//     onError: (error) => {
//       if (imageText) {
//         imageText.textContent =
//           error?.message || "이미지를 준비하는 중 오류가 발생했습니다.";
//       }
//     },
//   });

//   imageUploader.setUploadedUrl("");

//   imageInput.addEventListener("change", () => {
//     if (imageText) {
//       const fileName = imageInput.files?.[0]?.name;
//       imageText.textContent = fileName || "파일을 선택해주세요.";
//     }
//     imageUploader?.handleFileChange();
//   });
// };

// const getImageUrl = async () => {
//   if (!imageUploader) return "";
//   return imageUploader.ensureUploaded();
// };

// const setupAutoScrollInputs = () => {
//   const inputs = [titleInput, contentInput];
//   inputs
//     .filter((input) => input)
//     .forEach((input) => {
//       input.addEventListener("focus", () => {
//         input.scrollIntoView({ behavior: "smooth", block: "center" });
//       });
//     });
// };

// const handleSubmit = async ({ title, content }) => {
//   const user = ensureAuthUser();
//   if (!user) return;

//   let postImageUrl = "";
//   try {
//     postImageUrl = await getImageUrl();
//   } catch (error) {
//     throw new Error(error?.message || "이미지 업로드에 실패했습니다.");
//   }

//   const payload = {
//     title: title.trim(),
//     content: content.trim(),
//     postImageUrl: postImageUrl || undefined,
//   };
//   return createPost({ payload });
// };

// export const initPage = () => {
//   form?.addEventListener("submit", async (event) => {
//     event.preventDefault();

//     const msg = validateForm();
//     if (msg) {
//       if (contentError) contentError.textContent = msg;
//       updateButtonState();
//       return;
//     }

//     try {
//       await handleSubmit({
//         title: titleInput.value,
//         content: contentInput.value,
//       });
//       window.location.href = "./post-list.html";
//     } catch (error) {
//       if (contentError) contentError.textContent = error.message;
//     }
//   });

//   attachFieldEvents();
//   updateButtonState();
//   setupImageUploader();
//   setupAutoScrollInputs();
// };
