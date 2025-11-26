import { formatDateTime, formatCount } from "../utils/format.js";
import {
  fetchCommentsPage as fetchCommentsPageApi,
  createComment as createCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
} from "../../features/posts/services/api.js";
import { getStoredUser } from "../../features/users/store/user.js";

const ensureAuthUser = () => {
  const user = getStoredUser();
  if (!user) {
    alert("로그인이 필요합니다.");
    window.location.href = "./login.html";
    return null;
  }
  return user;
};

const createElement = (tag, className) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
};

const formatCountValue = (value) => formatCount(value ?? 0);

export const initCommentsSection = ({
  postId,
  initialData,
  initialCount = 0,
  countEls = [],
}) => {
  const listContainer = document.querySelector(".post-comments-list-container");
  const paginationEl = document.querySelector(".comments-pagination");
  const form = document.querySelector(".post-comment-input-container");
  const textarea = document.querySelector(".post-comment-input");
  const submitBtn = document.querySelector(".btn-comment-submit");
  const submitLabel = document.querySelector(".btn-comment-submit-label");
  const deleteModal = document.querySelector("#comment-delete-modal");

  if (!listContainer || !form || !textarea || !submitBtn) {
    return;
  }

  listContainer.addEventListener("click", (e) => {
    const target = e.target;

    // 삭제 버튼 클릭 처리
    const deleteBtn = target.closest(".btn-comment-delete");
    if (deleteBtn) {
      const wrapper = deleteBtn.closest(".post-comment-list");
      const commentId = wrapper.dataset.commentId;
      if (commentId) {
        openDeleteModal(commentId);
      }
      return;
    }

    // 수정 버튼 클릭 처리
    const editBtn = target.closest(".btn-comment-edit");
    if (editBtn) {
      const wrapper = editBtn.closest(".post-comment-list");
      const commentId = wrapper.dataset.commentId;

      const contentEl = wrapper.querySelector(".post-comment-text");
      const content = contentEl ? contentEl.textContent : "";
      enterEditMode({ commentId, content });
    }
  });

  const state = {
    page: initialData?.page ?? 1,
    totalPages: initialData?.totalPages ?? 1,
    editingCommentId: null,
    pendingDeleteCommentId: null,
    commentCount: Number(initialCount) || 0,
  };

  const updateCountEls = () => {
    countEls.forEach((el) => {
      if (!el) return;
      el.dataset.rawCount = String(state.commentCount);
      el.textContent = formatCountValue(state.commentCount);
    });
  };

  const adjustCommentCount = (delta) => {
    state.commentCount = Math.max(0, state.commentCount + delta);
    updateCountEls();
  };

  const toggleSubmitState = () => {
    const hasText = !!textarea.value.trim();
    submitBtn.disabled = !hasText;
    submitBtn.classList.toggle("active", hasText);
  };

  const resetEditMode = () => {
    state.editingCommentId = null;
    submitLabel
      ? (submitLabel.textContent = "댓글 등록")
      : (submitBtn.textContent = "댓글 등록");
    textarea.value = "";
    toggleSubmitState();
  };

  const enterEditMode = (comment) => {
    state.editingCommentId = comment.commentId;
    textarea.value = comment.content || "";
    submitLabel
      ? (submitLabel.textContent = "댓글 수정")
      : (submitBtn.textContent = "댓글 수정");
    toggleSubmitState();
    textarea.focus();
  };

  const closeDeleteModal = () => {
    state.pendingDeleteCommentId = null;
    deleteModal?.classList.remove("active");
  };

  const openDeleteModal = (commentId) => {
    state.pendingDeleteCommentId = commentId;
    deleteModal?.classList.add("active");
  };

  const createCommentElement = (comment) => {
    const wrapper = createElement("div", "post-comment-list");
    wrapper.dataset.commentId = comment.commentId;

    const info = createElement("div", "post-comment-list-info");
    const infoContainer = createElement("div", "post-comment-info-container");
    const profileWrap = createElement("div", "profile-img");
    const img = document.createElement("img");
    const profileImageUrl = comment.author?.profileImageUrl;
    img.src = profileImageUrl;
    img.alt = "작성자 아이콘";
    profileWrap.appendChild(img);

    const contentWrap = createElement("div", "post-comment-content");
    const detailTop = createElement("div", "post-comment-detail-top");

    const nameEl = createElement("p", "post-author-name");
    nameEl.textContent = comment.author?.nickname || "익명";
    const dateEl = createElement("p", "post-created-at");
    dateEl.textContent = formatDateTime(comment.createdAt);

    const actions = createElement("div", "post-comment-actions");
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-comment-edit";
    editBtn.innerHTML =
      '<img src="/public/images/edit-gray.svg" alt="댓글 수정" width="16" height="16" class="comment-action-icon" /><span>수정</span>';

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-comment-delete";
    deleteBtn.innerHTML =
      '<img src="/public/images/delete-gray.svg" alt="댓글 삭제" width="16" height="16" class="comment-action-icon" /><span>삭제</span>';

    actions.append(editBtn, deleteBtn);
    detailTop.append(nameEl, dateEl, actions);

    const textContainer = createElement("div", "post-comment-text-container");
    const textEl = createElement("p", "post-comment-text");
    textEl.textContent = comment.content || "";

    textContainer.appendChild(textEl);
    contentWrap.append(detailTop, textContainer);
    infoContainer.append(profileWrap, contentWrap);
    info.appendChild(infoContainer);
    wrapper.appendChild(info);

    return wrapper;
  };

  const renderCommentsList = (comments = []) => {
    if (!comments.length) {
      const empty = document.createElement("p");
      empty.textContent = "첫 댓글을 남겨보세요!";
      listContainer.replaceChildren(empty);
      return;
    }
    const commentElements = comments.map((comment) =>
      createCommentElement(comment)
    );
    listContainer.replaceChildren(...commentElements);
  };

  const renderPagination = () => {
    if (!paginationEl) return;

    if (state.totalPages <= 1) {
      paginationEl.replaceChildren();
      return;
    }

    const createButton = (label, targetPage, { disabled, active } = {}) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = "comments-page-btn";
      if (active) btn.classList.add("active");
      if (disabled) {
        btn.classList.add("disabled");
      } else {
        btn.addEventListener("click", () => {
          if (targetPage !== state.page) {
            loadPage(targetPage);
          }
        });
      }
      return btn;
    };

    const buttons = [];

    buttons.push(
      createButton("이전", state.page - 1, { disabled: state.page === 1 })
    );
    for (let page = 1; page <= state.totalPages; page += 1) {
      buttons.push(
        createButton(String(page), page, { active: page === state.page })
      );
    }
    buttons.push(
      createButton("다음", state.page + 1, {
        disabled: state.page === state.totalPages,
      })
    );
    paginationEl.replaceChildren(...buttons);
  };

  const loadPage = async (page) => {
    try {
      const data = await fetchCommentsPageApi({ postId, page });
      state.page = data.page;
      state.totalPages = data.totalPages ?? 1;
      renderCommentsList(data.content || []);
      renderPagination();
      resetEditMode();
    } catch (error) {
      console.error(error);
      alert(error?.message || "댓글을 불러오는 중 오류가 발생했습니다.");
    }
  };

  const attachDeleteModalEvents = () => {
    if (!deleteModal) return;
    const cancelBtn = deleteModal.querySelector(".modal-cancel");
    const confirmBtn = deleteModal.querySelector(".modal-confirm");

    cancelBtn?.addEventListener("click", closeDeleteModal);
    deleteModal.addEventListener("click", (event) => {
      if (event.target === deleteModal) {
        closeDeleteModal();
      }
    });

    confirmBtn?.addEventListener("click", async () => {
      if (!state.pendingDeleteCommentId) {
        closeDeleteModal();
        return;
      }
      const currentUser = ensureAuthUser();
      if (!currentUser) {
        closeDeleteModal();
        return;
      }
      try {
        await deleteCommentApi({
          commentId: state.pendingDeleteCommentId,
        });
        const target = listContainer.querySelector(
          `.post-comment-list[data-comment-id="${state.pendingDeleteCommentId}"]`
        );
        target?.remove();
        adjustCommentCount(-1);
        closeDeleteModal();
        resetEditMode();
        if (!listContainer.children.length) {
          renderCommentsList([]);
        }
      } catch (error) {
        alert(error?.message || "댓글 삭제 중 오류가 발생했습니다.");
        closeDeleteModal();
      }
    });
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const content = textarea.value.trim();
    if (!content) {
      toggleSubmitState();
      return;
    }

    const currentUser = ensureAuthUser();
    if (!currentUser) return;

    submitBtn.disabled = true;
    try {
      if (state.editingCommentId) {
        const updated = await updateCommentApi({
          commentId: state.editingCommentId,
          content,
        });
        const target = listContainer.querySelector(
          `.post-comment-list[data-comment-id="${state.editingCommentId}"] .post-comment-text`
        );
        if (target) target.textContent = updated.content;
        resetEditMode();
      } else {
        const newComment = await createCommentApi({
          postId,
          content,
        });
        if (
          listContainer.firstElementChild &&
          listContainer.firstElementChild.tagName === "P"
        ) {
          listContainer.innerHTML = "";
        }
        listContainer.prepend(createCommentElement(newComment));
        adjustCommentCount(1);
        resetEditMode();
      }
    } catch (error) {
      alert(error?.message || "댓글 처리 중 오류가 발생했습니다.");
    } finally {
      submitBtn.disabled = false;
    }
  });

  textarea.addEventListener("input", () => {
    if (!textarea.value.trim() && state.editingCommentId) {
      resetEditMode();
    } else {
      toggleSubmitState();
    }
  });

  attachDeleteModalEvents();
  updateCountEls();
  toggleSubmitState();

  if (initialData?.content?.length) {
    renderCommentsList(initialData.content);
    renderPagination();
  } else if (initialData && initialData.page) {
    renderPagination();
  } else {
    renderCommentsList([]);
    loadPage(1);
  }

  return {
    reload(page = 1) {
      loadPage(page);
    },
    setCount(value) {
      state.commentCount = Number(value) || 0;
      updateCountEls();
    },
  };
};
