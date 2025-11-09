import { getStoredUser } from "./utils/user.js";
const POST_BASE_URL = "/api/posts";
const ERROR_MSG = "*제목, 내용을 모두 작성해주세요.";

const form = document.querySelector(".post-update");
const titleInput = document.querySelector("#post-title");
const contentInput = document.querySelector("#post-content");
const contentError = document.querySelector("#post-content-error");
const submitButton = document.querySelector(".btn-post-submit");

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

/** 기존 게시글 조회해서 폼에 채우기: GET /api/posts/{postId}/{userId} */
const loadPostData = async (postId) => {
  const currentUser = getStoredUser();
  const userId = currentUser?.id ?? 0;

  try {
    const res = await fetch(`${POST_BASE_URL}/${postId}/${userId}`, {
      method: "GET",
      headers: { Accept: "*/*" },
    });

    if (!res.ok) {
      throw new Error("게시글 정보를 불러오지 못했습니다.");
    }

    const body = await res.json();
    const data = body.data;

    if (titleInput) titleInput.value = data.title || "";
    if (contentInput) contentInput.value = data.content || "";

    updateButtonState();
  } catch (error) {
    console.error(error);
    alert(error.message || "게시글 정보를 불러오는 중 오류가 발생했습니다.");
    window.location.href = "./post-list.html";
  }
};

/** 수정 요청: PUT /api/posts/{postId}/{userId} */
const submitUpdate = async ({ postId, title, content }) => {
  const currentUser = getStoredUser();
  if (!currentUser || !currentUser.id) {
    throw new Error("로그인이 필요합니다. 다시 로그인해주세요.");
  }

  const endpoint = `${POST_BASE_URL}/${postId}/${currentUser.id}`;
  const payload = {
    title: title.trim(),
    content: content.trim(),
    // TODO: 이미지 수정 필요 시 imageUrl 추가
  };

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 403) {
    throw new Error("게시글 수정 권한이 없습니다.");
  }

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || "게시글 수정에 실패했습니다.");
  }

  return result.data;
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
    submitButton.classList.add("is-loading");

    try {
      await submitUpdate({
        postId,
        title: titleInput.value,
        content: contentInput.value,
      });
      window.location.href = `./post-detail.html?postId=${postId}`;
    } catch (error) {
      alert(error.message || "게시글 수정 중 오류가 발생했습니다.");
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
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

  loadPostData(postId);
  setupForm(postId);
});
