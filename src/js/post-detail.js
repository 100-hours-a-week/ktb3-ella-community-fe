import { getStoredUser, requireAuthUser } from "./utils/user.js";
import { formatDateTime, formatCount } from "./utils/format.js";
import {
  fetchPostDetail as requestPostDetail,
  deletePost as deletePostApi,
} from "./services/api.js";
import { initLikeToggle } from "./post-detail/likes.js";
import { initCommentsSection } from "./post-detail/comments.js";

const DEFAULT_PROFILE_IMAGE = "/public/images/userProfile.png";
const DEFAULT_POST_IMAGE = "/public/images/postImage.jpeg";

const getPostIdFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("postId");
};

const selectAll = (selector) =>
  Array.from(document.querySelectorAll(selector)).filter(Boolean);

const updateCountElements = (elements, value = 0) => {
  const safeValue = Number(value) || 0;
  elements.forEach((el) => {
    el.dataset.rawCount = String(safeValue);
    el.textContent = formatCount(safeValue);
  });
};

const fetchPostData = (postId) => {
  const currentUser = getStoredUser();
  const userId = currentUser?.id ?? 0;
  return requestPostDetail({ postId, userId });
};

const renderPostDetail = (post) => {
  const titleEl = document.querySelector(".post-detail-title");
  const authorNameEl = document.querySelectorAll(".post-author-name");
  const createdAtEls = document.querySelectorAll(".post-created-at");
  const authorProfileImgs = document.querySelectorAll(
    ".post-detail-title-info .post-author-avatar"
  );
  const postImageEl = document.querySelector(".post-main-image");
  const contentEl = document.querySelector(".post-detail-content");
  const likeButton = document.querySelector(".btn-like");
  const shareButton = document.querySelector(".btn-share");
  const updateButton = document.querySelector(".btn-update");

  if (titleEl) titleEl.textContent = post.title || "";
  authorNameEl.forEach((el) => {
    el.textContent = post.author?.nickname || "알 수 없음";
  });
  createdAtEls.forEach((el) => {
    el.textContent = formatDateTime(post.createdAt);
  });
  authorProfileImgs.forEach((img) => {
    const src = post.author?.profileImageUrl || img.dataset.placeholder || DEFAULT_PROFILE_IMAGE;
    img.addEventListener(
      "load",
      () => img.classList.add("is-loaded"),
      { once: true }
    );
    img.src = src;
  });

  if (postImageEl) {
    const src = post.imageUrl || postImageEl.dataset.placeholder || DEFAULT_POST_IMAGE;
    postImageEl.addEventListener(
      "load",
      () => postImageEl.classList.add("is-loaded"),
      { once: true }
    );
    postImageEl.src = src;
  }
  if (contentEl) {
    contentEl.textContent = post.content || "";
  }

  const likeCountEls = selectAll(".post-like-count-value");
  const commentCountEls = selectAll(".post-comment-count-value");
  const viewCountEls = selectAll(".post-view-count-value");

  updateCountElements(likeCountEls, post.likeCount ?? 0);
  updateCountElements(commentCountEls, post.commentCount ?? 0);
  updateCountElements(viewCountEls, post.viewCount ?? 0);

  if (updateButton) {
    updateButton.addEventListener("click", () => {
      window.location.href = `./post-update.html?postId=${post.postId}`;
    });
  }

  return {
    likeButton,
    shareButton,
    likeCountEls,
    commentCountEls,
  };
};

const setupAuthorSidebar = (post) => {
  const sidebarNameEl = document.querySelector(".author-name");
  const sidebarBioEl = document.querySelector(".author-bio");
  const sidebarImageEl = document.querySelector(".post-sidebar-avatar");

  if (sidebarNameEl) {
    sidebarNameEl.textContent = post.author?.nickname || "알 수 없음";
  }
  if (sidebarBioEl) {
    sidebarBioEl.textContent = post.author?.bio || "열정적인 커뮤니티 멤버";
  }
  if (sidebarImageEl) {
    const src = post.author?.profileImageUrl || sidebarImageEl.dataset.placeholder || DEFAULT_PROFILE_IMAGE;
    sidebarImageEl.addEventListener(
      "load",
      () => sidebarImageEl.classList.add("is-loaded"),
      { once: true }
    );
    sidebarImageEl.src = src;
  }
};

const setupShareButton = (button, post) => {
  if (!button) return;
  button.addEventListener("click", async () => {
    const shareUrl = `${window.location.origin}/public/post-detail.html?postId=${post.postId}`;
    const shareData = {
      title: post.title || "게시글",
      text: post.content?.slice(0, 50) || "게시글을 확인해보세요.",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("링크가 복사되었습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("공유하기 도중 오류가 발생했습니다.");
    }
  });
};

const setupPostDeleteModal = (postId) => {
  const modal = document.getElementById("post-delete-modal");
  const deleteButton = document.querySelector(".btn-delete");
  if (!modal || !deleteButton) return;

  const cancelBtn = modal.querySelector(".modal-cancel");
  const confirmBtn = modal.querySelector(".modal-confirm");

  const openModal = () => modal.classList.add("active");
  const closeModal = () => modal.classList.remove("active");

  deleteButton.addEventListener("click", openModal);
  cancelBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  confirmBtn?.addEventListener("click", async () => {
    const currentUser = requireAuthUser();
    if (!currentUser) {
      closeModal();
      return;
    }
    try {
      await deletePostApi({ postId, userId: currentUser.id });
      window.location.href = "./post-list.html";
    } catch (error) {
      alert(error?.message || "게시글 삭제 중 오류가 발생했습니다.");
    } finally {
      closeModal();
    }
  });
};

const initializePage = async () => {
  const postId = getPostIdFromQuery();
  if (!postId) {
    alert("잘못된 접근입니다.");
    window.location.href = "./post-list.html";
    return;
  }

  try {
    const post = await fetchPostData(postId);
    const { likeButton, shareButton, likeCountEls, commentCountEls } =
      renderPostDetail(post);
    setupAuthorSidebar(post);
    setupShareButton(shareButton, post);
    setupPostDeleteModal(post.postId);

    initLikeToggle({
      postId: post.postId,
      buttonEl: likeButton,
      countEls: likeCountEls,
      initialLiked: post.liked,
      initialCount: post.likeCount,
    });

    initCommentsSection({
      postId: post.postId,
      initialData: post.comments,
      initialCount: post.commentCount,
      countEls: commentCountEls,
    });
  } catch (error) {
    console.error(error);
    alert(error?.message || "게시글을 불러오는 중 오류가 발생했습니다.");
    window.location.href = "./post-list.html";
  }
};

document.addEventListener("DOMContentLoaded", initializePage);
