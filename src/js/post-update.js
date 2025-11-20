import { getStoredUser } from "./utils/user.js";
import {
  fetchPostDetail as requestPostDetail,
  updatePost as updatePostApi,
} from "./services/api.js";
import { createImageUploadController } from "./utils/imageUploadController.js";

const ERROR_MSG = "*제목, 내용을 모두 작성해주세요.";

const form = document.querySelector(".post-update");
const titleInput = document.querySelector("#post-title");
const contentInput = document.querySelector("#post-content");
const contentError = document.querySelector("#post-content-error");
const submitButton = document.querySelector(".btn-post-submit");
const imageInput = document.querySelector("#post-image-input");
const imageText = document.querySelector("#post-image-text");
const imagePreview = document.querySelector(".post-image-preview");
let imageUploader = null;

/** URL 쿼리에서 postId 추출 */
const getPostIdFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("postId");
};

const isFilled = () => {
  const title = (titleInput?.value || "").trim();
  const content = (contentInput?.value || "").trim();
  return !!title && !!content;
};

const validateForm = () => {
  return isFilled() ? "" : ERROR_MSG;
};

const updateButtonState = () => {
  if (!submitButton) return;
  if (isFilled()) {
    submitButton.classList.add("active");
  } else {
    submitButton.classList.remove("active");
  }
};

/** 기존 게시글 조회해서 폼에 채우기: GET /api/posts/{postId} */
const loadPostData = async (postId) => {
  try {
    const data = await requestPostDetail({ postId });

    if (titleInput) titleInput.value = data.title || "";
    if (contentInput) contentInput.value = data.content || "";
    if (imageUploader) {
      imageUploader.setUploadedUrl(data.postImageUrl || "");
      if (imageText) {
        imageText.textContent = data.postImageUrl
          ? "현재 등록된 이미지가 있습니다."
          : "파일을 선택해주세요.";
      }
    }

    updateButtonState();
  } catch (error) {
    console.error(error);
    alert(error.message || "게시글 정보를 불러오는 중 오류가 발생했습니다.");
    window.location.href = "./post-list.html";
  }
};

/** 수정 요청: PUT /api/posts/{postId} */
const submitUpdate = async ({ postId, title, content, postImageUrl }) => {
  const currentUser = getStoredUser();
  if (!currentUser || !currentUser.id) {
    throw new Error("로그인이 필요합니다. 다시 로그인해주세요.");
  }

  const payload = {
    title: title.trim(),
    content: content.trim(),
    postImageUrl: postImageUrl || undefined,
  };

  return updatePostApi({
    postId,
    payload,
  });
};

const setupImageUploader = () => {
  if (!imageInput || !imagePreview) return;

  imageUploader = createImageUploadController({
    inputEl: imageInput,
    previewEl: imagePreview,
    defaultPreview: imagePreview.dataset.placeholder || "",
    onError: (error) => {
      if (imageText) {
        imageText.textContent =
          error?.message || "이미지를 준비하는 중 오류가 발생했습니다.";
      }
    },
  });

  imageUploader.setUploadedUrl("");

  imageInput.addEventListener("change", () => {
    if (imageText) {
      const fileName = imageInput.files?.[0]?.name;
      imageText.textContent = fileName || "파일을 선택해주세요.";
    }
    imageUploader?.handleFileChange();
  });
};

const getImageUrl = async () => {
  if (!imageUploader) return "";
  return imageUploader.ensureUploaded();
};

const setupAutoScrollInputs = () => {
  const inputs = [titleInput, contentInput];
  inputs
    .filter((input) => input)
    .forEach((input) => {
      input.addEventListener("focus", () => {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
};

const setupForm = (postId) => {
  if (!form || !titleInput || !contentInput || !submitButton) return;

  titleInput.addEventListener("input", () => {
    if (contentError) contentError.textContent = "";
    updateButtonState();
  });

  contentInput.addEventListener("input", () => {
    if (contentError) contentError.textContent = "";
    updateButtonState();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = validateForm();

    if (contentError) contentError.textContent = errorMsg;

    updateButtonState();
    if (errorMsg) return;

    submitButton.disabled = true;

    try {
      let postImageUrl = "";
      try {
        postImageUrl = await getImageUrl();
      } catch (uploadError) {
        alert(uploadError.message || "이미지 업로드 중 오류가 발생했습니다.");
        submitButton.disabled = false;
        return;
      }

      await submitUpdate({
        postId,
        title: titleInput.value,
        content: contentInput.value,
        postImageUrl,
      });
      window.location.href = `./post-detail.html?postId=${postId}`;
    } catch (error) {
      alert(error.message || "게시글 수정 중 오류가 발생했습니다.");
    } finally {
      submitButton.disabled = false;
    }
  });
};

/** 초기화 */
document.addEventListener("DOMContentLoaded", () => {
  const postId = getPostIdFromQuery();

  if (!postId) {
    alert("잘못된 접근입니다.");
    window.location.href = "./post-list.html";
    return;
  }

  setupImageUploader();
  setupAutoScrollInputs();
  loadPostData(postId);
  setupForm(postId);
});
