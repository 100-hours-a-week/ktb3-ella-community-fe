import { getStoredUser, requireAuthUser } from "./utils/user.js";
import { formatDateTime, formatCount } from "./utils/format.js";

const POST_DETAIL_BASE_URL = "/api/posts";
const COMMENTS_BASE_URL = "/api/comments";
const DEFAULT_PROFILE_IMAGE = "/public/images/userProfile.png";
const DEFAULT_POST_IMAGE = "/public/images/postImage.jpeg";

let currentCommentsPage = 1;
let totalCommentsPages = 1;

let editingCommentId = null;
let pendingDeleteCommentId = null;
let pendingDeletePostId = null;

/** URL 쿼리 postId */
const getPostIdFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("postId");
};

/** 상세 조회 */
const fetchPostDetail = async (postId) => {
  const currentUser = getStoredUser();
  const userId = currentUser?.id ?? 0;

  const res = await fetch(`${POST_DETAIL_BASE_URL}/${postId}/${userId}`, {
    method: "GET",
    headers: { Accept: "*/*" },
  });

  if (!res.ok) throw new Error("게시글 정보를 불러오지 못했습니다.");

  const body = await res.json();
  return body.data;
};

/** 댓글 페이지 조회 */
const fetchCommentsPage = async (postId, page) => {
  const res = await fetch(
    `${POST_DETAIL_BASE_URL}/${postId}/comments?page=${page}`,
    {
      method: "GET",
      headers: { Accept: "*/*" },
    }
  );

  if (!res.ok) throw new Error("댓글을 불러오지 못했습니다.");

  const body = await res.json();
  return body.data;
};

/** 댓글 요소 생성 */
const createCommentElement = (comment) => {
  const wrapper = document.createElement("div");
  wrapper.className = "post-comment-list";
  wrapper.dataset.commentId = comment.commentId;

  const info = document.createElement("div");
  info.className = "post-comment-list-info";

  const infoContainer = document.createElement("div");
  infoContainer.className = "post-comment-info-container";

  const profileWrap = document.createElement("div");
  profileWrap.className = "profile-img";

  const img = document.createElement("img");
  img.src = DEFAULT_PROFILE_IMAGE;
  img.width = 30;
  img.height = 30;
  img.alt = "작성자 아이콘";
  profileWrap.appendChild(img);

  const nameDate = document.createElement("div");
  nameDate.className = "post-author-name-date";

  const nameEl = document.createElement("p");
  nameEl.className = "post-author-name";
  nameEl.textContent = comment.author?.nickname || "익명";

  const dateEl = document.createElement("p");
  dateEl.className = "post-created-at";
  dateEl.textContent = formatDateTime(comment.createdAt);

  nameDate.append(nameEl, dateEl);
  infoContainer.append(profileWrap, nameDate);

  const textContainer = document.createElement("div");
  textContainer.className = "post-comment-text-container";

  const textEl = document.createElement("p");
  textEl.className = "post-comment-text";
  textEl.textContent = comment.content || "";

  textContainer.appendChild(textEl);

  info.append(infoContainer, textContainer);
  wrapper.appendChild(info);

  // 수정 / 삭제 버튼
  const actions = document.createElement("div");
  actions.className = "post-comment-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn-comment-edit";
  editBtn.textContent = "수정";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn-comment-delete";
  deleteBtn.textContent = "삭제";

  actions.append(editBtn, deleteBtn);
  wrapper.appendChild(actions);

  editBtn.addEventListener("click", () => enterEditMode(comment));
  deleteBtn.addEventListener("click", () =>
    openCommentDeleteModal(comment.commentId)
  );

  return wrapper;
};

/** 댓글 리스트 렌더링 */
const renderCommentsList = (comments) => {
  const container = document.querySelector(".post-comments-list-container");
  if (!container) return;

  container.innerHTML = "";

  if (!comments || comments.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "첫 댓글을 남겨보세요!";
    container.appendChild(empty);
    return;
  }

  comments.forEach((c) => {
    container.appendChild(createCommentElement(c));
  });
};

/** 댓글 페이지네이션 렌더링 */
const renderCommentsPagination = (postId, page, totalPages) => {
  const pagination = document.querySelector(".comments-pagination");
  if (!pagination) return;
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  const makeBtn = (label, target, opts = {}) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.className = "comments-page-btn";
    if (opts.active) btn.classList.add("active");
    if (opts.disabled) {
      btn.classList.add("disabled");
    } else {
      btn.addEventListener("click", () => {
        if (target !== page) loadCommentsPage(postId, target);
      });
    }
    return btn;
  };

  pagination.appendChild(makeBtn("이전", page - 1, { disabled: page === 1 }));

  for (let p = 1; p <= totalPages; p++) {
    pagination.appendChild(makeBtn(String(p), p, { active: p === page }));
  }

  pagination.appendChild(
    makeBtn("다음", page + 1, { disabled: page === totalPages })
  );
};

/** 특정 페이지 댓글 로드 */
const loadCommentsPage = async (postId, page) => {
  try {
    const data = await fetchCommentsPage(postId, page);
    currentCommentsPage = data.page;
    totalCommentsPages = data.totalPages ?? 1;

    renderCommentsList(data.content || []);
    renderCommentsPagination(postId, currentCommentsPage, totalCommentsPages);
    resetEditMode();
  } catch (e) {
    console.error(e);
    alert(e.message || "댓글을 불러오는 중 오류가 발생했습니다.");
  }
};

/** 게시글 상세 렌더링 */
const renderPostDetail = (post) => {
  if (!post) return;

  const titleEl = document.querySelector(".post-detail-title");
  const authorNameEl = document.querySelector(
    ".post-detail-title-info .post-author-name"
  );
  const createdAtEl = document.querySelector(
    ".post-detail-title-info .post-created-at"
  );
  const profileImgEl = document.querySelector(
    ".post-detail-title-info .profile-img img"
  );
  const postImageEl = document.querySelector(".post-img img");
  const contentEl = document.querySelector(".post-detail-content");

  const likeBtn = document.querySelector(".like-button");
  const likeValueEl = likeBtn?.querySelector(".post-count-value");
  const viewValueEl = document.querySelector(
    ".view-count-box .post-count-value"
  );
  const commentValueEl = document.querySelector(
    ".comment-count-box .post-count-value"
  );

  if (titleEl) titleEl.textContent = post.title || "";
  if (authorNameEl)
    authorNameEl.textContent = post.author?.nickname || "알 수 없음";
  if (createdAtEl) createdAtEl.textContent = formatDateTime(post.createdAt);
  if (profileImgEl) profileImgEl.src = DEFAULT_PROFILE_IMAGE;

  if (postImageEl) postImageEl.src = DEFAULT_POST_IMAGE;

  if (contentEl) contentEl.textContent = post.content || "";

  const likeCount = post.likeCount ?? 0;
  const viewCount = post.viewCount ?? 0;
  const commentCount = post.commentCount ?? 0;

  if (likeValueEl) {
    likeValueEl.dataset.rawCount = String(likeCount);
    likeValueEl.textContent = formatCount(likeCount);
  }
  if (viewValueEl) {
    viewValueEl.dataset.rawCount = String(viewCount);
    viewValueEl.textContent = formatCount(viewCount);
  }
  if (commentValueEl) {
    commentValueEl.dataset.rawCount = String(commentCount);
    commentValueEl.textContent = formatCount(commentCount);
  }

  // 좋아요 토글
  if (likeBtn && likeValueEl) {
    likeBtn.dataset.liked = post.liked ? "true" : "false";
    if (post.liked) likeBtn.classList.add("active");

    likeBtn.addEventListener("click", async () => {
      const currentUser = requireAuthUser();
      if (!currentUser) return;

      const postId = post.postId;
      const userId = currentUser.id;
      const liked = likeBtn.dataset.liked === "true";
      const current = Number(likeValueEl.dataset.rawCount || "0");

      try {
        if (!liked) {
          const res = await fetch(`/api/posts/${postId}/likes/${userId}`, {
            method: "POST",
            headers: { Accept: "*/*" },
          });
          if (!res.ok) throw new Error("좋아요 요청 실패");

          const next = current + 1;
          likeBtn.dataset.liked = "true";
          likeBtn.classList.add("active");
          likeValueEl.dataset.rawCount = String(next);
          likeValueEl.textContent = formatCount(next);
        } else {
          const res = await fetch(`/api/posts/${postId}/likes/${userId}`, {
            method: "DELETE",
            headers: { Accept: "*/*" },
          });
          if (!res.ok && res.status !== 204)
            throw new Error("좋아요 취소 실패");

          const next = Math.max(current - 1, 0);
          likeBtn.dataset.liked = "false";
          likeBtn.classList.remove("active");
          likeValueEl.dataset.rawCount = String(next);
          likeValueEl.textContent = formatCount(next);
        }
      } catch (err) {
        alert(err.message || "좋아요 처리 중 오류가 발생했습니다.");
      }
    });
  }

  // 초기 댓글: 상세에 comments 있으면 사용, 아니면 1페이지 로드
  if (post.comments && post.comments.content) {
    currentCommentsPage = post.comments.page ?? 1;
    totalCommentsPages = post.comments.totalPages ?? 1;

    renderCommentsList(post.comments.content || []);
    renderCommentsPagination(
      post.postId,
      currentCommentsPage,
      totalCommentsPages
    );
  } else {
    loadCommentsPage(post.postId, 1);
  }

  // 수정 버튼: 수정 페이지 이동
  const updateBtn = document.querySelector(".btn-update");
  if (updateBtn) {
    updateBtn.addEventListener("click", () => {
      window.location.href = `./post-update.html?postId=${post.postId}`;
    });
  }

  // 삭제 버튼: 삭제 모달 오픈
  const deleteBtn = document.querySelector(".btn-delete");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      openPostDeleteModal(post.postId);
    });
  }
};

/** 댓글 입력 버튼 활성/비활성 */
const setupCommentInputState = () => {
  const textarea = document.querySelector(".post-comment-input");
  const submitBtn = document.querySelector(".btn-comment-submit");
  if (!textarea || !submitBtn) return;

  const updateState = () => {
    const hasText = textarea.value.trim().length > 0;
    if (hasText) {
      submitBtn.classList.add("active");
      submitBtn.disabled = false;
    } else {
      submitBtn.classList.remove("active");
      submitBtn.disabled = true;
      if (!editingCommentId) {
        submitBtn.textContent = "댓글 등록";
      }
    }
  };

  textarea.addEventListener("input", updateState);
  updateState();
};

/** 댓글 작성/수정 */
const setupCommentForm = (postId) => {
  const form = document.querySelector(".post-comment-input-container");
  const textarea = document.querySelector(".post-comment-input");
  const submitBtn = document.querySelector(".btn-comment-submit");
  const listContainer = document.querySelector(".post-comments-list-container");
  const commentCountEl = document.querySelector(
    ".comment-count-box .post-count-value"
  );

  if (!form || !textarea || !submitBtn || !listContainer) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = textarea.value.trim();
    if (!content) return;

    const currentUser = requireAuthUser();
    if (!currentUser) return;

    try {
      // 수정 모드
      if (editingCommentId) {
        const res = await fetch(
          `${COMMENTS_BASE_URL}/${editingCommentId}/${currentUser.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
            },
            body: JSON.stringify({ content }),
          }
        );

        if (res.status === 403) {
          alert("댓글 수정 권한이 없습니다.");
          resetEditMode();
          return;
        }
        if (!res.ok) throw new Error("댓글 수정에 실패했습니다.");

        const body = await res.json();
        const updated = body.data;

        const target = listContainer.querySelector(
          `.post-comment-list[data-comment-id="${editingCommentId}"] .post-comment-text`
        );
        if (target) target.textContent = updated.content;

        resetEditMode();
        textarea.value = "";
        submitBtn.classList.remove("active");
        submitBtn.disabled = true;
      } else {
        // 신규 댓글 등록
        const res = await fetch(
          `${POST_DETAIL_BASE_URL}/${postId}/comments/${currentUser.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
            },
            body: JSON.stringify({ content }),
          }
        );
        if (!res.ok) throw new Error("댓글 등록에 실패했습니다.");

        const body = await res.json();
        const newComment = body.data;

        // 리스트에 바로 추가
        if (
          listContainer.firstElementChild &&
          listContainer.firstElementChild.tagName === "P"
        ) {
          listContainer.innerHTML = "";
        }
        const el = createCommentElement(newComment);
        listContainer.prepend(el);

        // 댓글 수 +1 UI만 갱신하도록
        if (commentCountEl) {
          const raw = Number(commentCountEl.dataset.rawCount || "0");
          const next = raw + 1;
          commentCountEl.dataset.rawCount = String(next);
          commentCountEl.textContent = formatCount(next);
        }

        textarea.value = "";
        submitBtn.classList.remove("active");
        submitBtn.disabled = true;
      }
    } catch (err) {
      alert(err.message || "댓글 처리 중 오류가 발생했습니다.");
    }
  });
};

/** 수정 모드 진입 */
const enterEditMode = (comment) => {
  const textarea = document.querySelector(".post-comment-input");
  const submitBtn = document.querySelector(".btn-comment-submit");
  if (!textarea || !submitBtn) return;

  editingCommentId = comment.commentId;
  textarea.value = comment.content;
  submitBtn.textContent = "댓글 수정";
  submitBtn.classList.add("active");
  submitBtn.disabled = false;
  textarea.focus();
};

/** 수정 모드 리셋 */
const resetEditMode = () => {
  const textarea = document.querySelector(".post-comment-input");
  const submitBtn = document.querySelector(".btn-comment-submit");
  editingCommentId = null;
  if (submitBtn) submitBtn.textContent = "댓글 등록";
  if (textarea && !textarea.value.trim()) {
    submitBtn?.classList.remove("active");
    if (submitBtn) submitBtn.disabled = true;
  }
};

/* 댓글 삭제 모달 */

const openCommentDeleteModal = (commentId) => {
  pendingDeleteCommentId = commentId;
  const modal = document.getElementById("comment-delete-modal");
  modal?.classList.add("active");
};

const closeCommentDeleteModal = () => {
  pendingDeleteCommentId = null;
  const modal = document.getElementById("comment-delete-modal");
  modal?.classList.remove("active");
};

const setupCommentDeleteModal = () => {
  const modal = document.getElementById("comment-delete-modal");
  if (!modal) return;

  const cancelBtn = modal.querySelector(".modal-cancel");
  const confirmBtn = modal.querySelector(".modal-confirm");
  const listContainer = document.querySelector(".post-comments-list-container");
  const commentCountEl = document.querySelector(
    ".comment-count-box .post-count-value"
  );

  cancelBtn?.addEventListener("click", closeCommentDeleteModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeCommentDeleteModal();
  });

  confirmBtn?.addEventListener("click", async () => {
    if (!pendingDeleteCommentId) return;

    const currentUser = requireAuthUser();
    if (!currentUser) {
      closeCommentDeleteModal();
      return;
    }

    try {
      const res = await fetch(
        `${COMMENTS_BASE_URL}/${pendingDeleteCommentId}/${currentUser.id}`,
        {
          method: "DELETE",
          headers: { Accept: "*/*" },
        }
      );

      if (res.status === 403) {
        alert("댓글 삭제 권한이 없습니다.");
        closeCommentDeleteModal();
        return;
      }
      if (!res.ok && res.status !== 204) {
        throw new Error("댓글 삭제에 실패했습니다.");
      }

      const target = listContainer.querySelector(
        `.post-comment-list[data-comment-id="${pendingDeleteCommentId}"]`
      );
      if (target) target.remove();

      // 댓글 수 -1
      if (commentCountEl) {
        const raw = Number(commentCountEl.dataset.rawCount || "0");
        const next = Math.max(raw - 1, 0);
        commentCountEl.dataset.rawCount = String(next);
        commentCountEl.textContent = formatCount(next);
      }

      closeCommentDeleteModal();
      resetEditMode();
    } catch (err) {
      alert(err.message || "댓글 삭제 중 오류가 발생했습니다.");
      closeCommentDeleteModal();
    }
  });
};

/* 게시글 삭제 모달 */

const openPostDeleteModal = (postId) => {
  pendingDeletePostId = postId;
  const modal = document.getElementById("post-delete-modal");
  modal?.classList.add("active");
};

const closePostDeleteModal = () => {
  pendingDeletePostId = null;
  const modal = document.getElementById("post-delete-modal");
  modal?.classList.remove("active");
};

const setupPostDeleteModal = () => {
  const modal = document.getElementById("post-delete-modal");
  if (!modal) return;

  const cancelBtn = modal.querySelector(".modal-cancel");
  const confirmBtn = modal.querySelector(".modal-confirm");

  cancelBtn?.addEventListener("click", closePostDeleteModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePostDeleteModal();
  });

  confirmBtn?.addEventListener("click", async () => {
    if (!pendingDeletePostId) return;

    const currentUser = requireAuthUser();
    if (!currentUser) {
      closePostDeleteModal();
      return;
    }

    try {
      const res = await fetch(
        `${POST_DETAIL_BASE_URL}/${pendingDeletePostId}/${currentUser.id}`,
        {
          method: "DELETE",
          headers: { Accept: "*/*" },
        }
      );

      if (res.status === 403) {
        alert("게시글 삭제 권한이 없습니다.");
        closePostDeleteModal();
        return;
      }
      if (!res.ok && res.status !== 204) {
        throw new Error("게시글 삭제에 실패했습니다.");
      }

      closePostDeleteModal();
      window.location.href = "./post-list.html";
    } catch (err) {
      alert(err.message || "게시글 삭제 중 오류가 발생했습니다.");
      closePostDeleteModal();
    }
  });
};

/** 초기화 */
document.addEventListener("DOMContentLoaded", async () => {
  const postId = getPostIdFromQuery();

  if (!postId) {
    alert("잘못된 접근입니다.");
    window.location.href = "./post-list.html";
    return;
  }

  try {
    const post = await fetchPostDetail(postId);
    renderPostDetail(post);
    setupCommentInputState();
    setupCommentForm(postId);
    setupCommentDeleteModal();
    setupPostDeleteModal();
  } catch (err) {
    console.error(err);
    alert(err.message || "게시글을 불러오는 중 오류가 발생했습니다.");
    window.location.href = "./post-list.html";
  }
});
