"use strict";

const USER_STORAGE_KEY = "ktb3-community:user";
const POST_BASE_URL = "/api/posts";
const ERROR_MSG = "*제목, 내용을 모두 작성해주세요.";

const form = document.querySelector(".post-update");
const titleInput = document.querySelector("#post-title");
const contentInput = document.querySelector("#post-content");
const contentError = document.querySelector("#post-content-error");
const submitButton = document.querySelector(".btn-post-submit");

/** 현재 로그인 유저 조회 */
const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("사용자 정보를 불러오지 못했습니다.", e);
    return null;
  }
};

/** URL 쿼리에서 postId 추출 */
const getPostIdFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("postId");
};

/** 제목/내용 둘 다 채워졌는지 */
const isFilled = () => {
  const title = (titleInput?.value || "").trim();
  const content = (contentInput?.value || "").trim();
  return !!title && !!content;
};

/** 폼 전체 유효성 (공통 메시지) */
const validateForm = () => {
  return isFilled() ? "" : ERROR_MSG;
};

/** 버튼 활성화 상태 업데이트 */
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
  const currentUser = getCurrentUser();
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
  const currentUser = getCurrentUser();

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

/** 이벤트 바인딩 */
const setupForm = (postId) => {
  if (!form || !titleInput || !contentInput || !submitButton) return;

  // 입력 시 에러 제거 + 버튼 상태 업데이트
  titleInput.addEventListener("input", () => {
    if (contentError) contentError.textContent = "";
    updateButtonState();
  });

  contentInput.addEventListener("input", () => {
    if (contentError) contentError.textContent = "";
    updateButtonState();
  });

  // 제출 시 검증 + 업데이트
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = validateForm();

    if (titleError) titleError.textContent = errorMsg;
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
