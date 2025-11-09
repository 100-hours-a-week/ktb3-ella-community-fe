import { getStoredUser } from "./utils/user.js";

const POST_CREATE_BASE_ENDPOINT = "/api/posts";
const DEFAULT_IMAGE_URL = "/public/images/postImage.jpeg";

const getCurrentUser = () => getStoredUser();

const form = document.querySelector(".post-create");
const titleInput = document.querySelector("#post-title");
const contentInput = document.querySelector("#post-content");
const submitButton = document.querySelector(".btn-post-submit");
const contentError = document.querySelector("#post-content-error");

const ERROR_MSG = "*제목, 내용을 모두 작성해주세요.";

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

const attachFieldEvents = () => {
  titleInput?.addEventListener("input", () => {
    updateButtonState();
    if (isFilled() && contentError) contentError.textContent = "";
  });

  contentInput?.addEventListener("input", () => {
    updateButtonState();
    if (isFilled() && contentError) contentError.textContent = "";
  });
};

const handleSubmit = async ({ title, content }) => {
  const user = getCurrentUser();
  if (!user || !user.id) {
    throw new Error("*로그인 정보가 없습니다. 다시 로그인해주세요.");
  }

  const endpoint = `${POST_CREATE_BASE_ENDPOINT}/${user.id}`;

  const payload = {
    title: title.trim(),
    content: content.trim(),
    imageUrl: DEFAULT_IMAGE_URL,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "*게시글 생성에 실패했습니다.");
    }

    return result;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("서버 응답을 처리할 수 없습니다.");
    }
    throw error;
  }
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  // 버튼 클릭했을 때만 검증
  const msg = validateForm();
  if (msg) {
    if (contentError) contentError.textContent = msg;
    updateButtonState();
    return;
  }

  submitButton.classList.add("is-loading");

  try {
    await handleSubmit({
      title: titleInput.value,
      content: contentInput.value,
    });
    window.location.href = "./post-list.html";
  } catch (error) {
    if (contentError) contentError.textContent = error.message;
  } finally {
    submitButton.classList.remove("is-loading");
  }
});

attachFieldEvents();
updateButtonState();
