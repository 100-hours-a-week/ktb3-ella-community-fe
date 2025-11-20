import { formatCount } from "../utils/format.js";
import { requireAuthUser } from "../utils/user.js";
import { likePost, unlikePost } from "../services/api.js";

const ensureAuthUser = () => {
  const user = requireAuthUser();
  if (!user) {
    alert("로그인이 필요합니다.");
    window.location.href = "./login.html";
    return null;
  }
  return user;
};

const updateCountElements = (elements = [], count = 0) => {
  elements.forEach((el) => {
    if (!el) return;
    el.dataset.rawCount = String(count);
    el.textContent = formatCount(count);
  });
};

const setButtonState = (button, liked) => {
  if (!button) return;
  button.dataset.liked = liked ? "true" : "false";
  button.classList.toggle("active", liked);
};

export const initLikeToggle = ({
  postId,
  buttonEl,
  countEls = [],
  initialLiked = false,
  initialCount = 0,
}) => {
  if (!postId || !buttonEl) return;

  const state = {
    liked: Boolean(initialLiked),
    count: Number(initialCount) || 0,
  };

  const safeUpdateUI = () => {
    setButtonState(buttonEl, state.liked);
    updateCountElements(countEls, state.count);
  };

  safeUpdateUI();

  buttonEl.addEventListener("click", async () => {
    const currentUser = ensureAuthUser();
    if (!currentUser) return;

    buttonEl.disabled = true;
    try {
      if (!state.liked) {
        await likePost({ postId });
        state.liked = true;
        state.count += 1;
      } else {
        await unlikePost({ postId });
        state.liked = false;
        state.count = Math.max(0, state.count - 1);
      }
      safeUpdateUI();
    } catch (error) {
      alert(error?.message || "좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      buttonEl.disabled = false;
    }
  });

  return {
    updateCount(count) {
      state.count = Number(count) || 0;
      safeUpdateUI();
    },
    setLiked(liked) {
      state.liked = Boolean(liked);
      safeUpdateUI();
    },
  };
};
