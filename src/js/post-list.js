import { formatDateTime, formatCount } from "./utils/format.js";
import { fetchPostList } from "./services/api.js";

const DEFAULT_PROFILE_IMAGE = "/public/images/userProfile.png";

const listContainer = document.querySelector(".post-list-content-wrapper");
const createButton = document.querySelector(".btn-post-create");
const sortSelect = document.querySelector(".post-filter-select");

let currentPage = 1;
const pageSize = 10;
let currentSort = "NEW";
let isLoading = false;
let hasNextPage = true;
let scrollThrottle;

// 게시글 생성
const createPostElement = (post) => {
  const {
    postId,
    title,
    author,
    likeCount,
    viewCount,
    commentCount,
    createdAt,
  } = post;

  const wrapper = document.createElement("div");
  wrapper.className = "post-list-content";

  const contentContainer = document.createElement("div");
  contentContainer.className = "post-list-content-container";

  const tagsWrapper = document.createElement("div");
  tagsWrapper.className = "post-tags";

  const tags = ["React", "JavaScript"];
  tags.forEach((tagText) => {
    const tagEl = document.createElement("span");
    tagEl.className = "post-tag";
    tagEl.textContent = `${tagText}`;
    tagsWrapper.appendChild(tagEl);
  });

  const titleEl = document.createElement("h1");
  titleEl.className = "post-title";
  titleEl.textContent = title;

  contentContainer.append(tagsWrapper, titleEl);

  const authorBox = document.createElement("div");
  authorBox.className = "author-profile";

  const authorLeft = document.createElement("div");
  authorLeft.className = "author-left";

  const authorInfo = document.createElement("div");
  authorInfo.className = "author-info";

  const profileImgWrap = document.createElement("div");
  profileImgWrap.className = "author-profile-image";

  const img = document.createElement("img");
  const profileImageUrl =
    author?.profileImageUrl ||
    author?.profileImage ||
    post.authorProfileImageUrl ||
    post.authorProfileImage;
  img.alt = "작성자 아이콘";
  if (profileImageUrl) {
    img.loading = "lazy";
    img.src = profileImageUrl;
  } else {
    img.src = DEFAULT_PROFILE_IMAGE;
  }

  profileImgWrap.appendChild(img);

  const nickname = document.createElement("strong");
  nickname.textContent = (author && author.nickname) || "알 수 없음";

  authorInfo.append(profileImgWrap, nickname);

  const metaBox = document.createElement("div");
  metaBox.className = "post-meta";

  const metaItems = [
    {
      icon: "/public/images/like.svg",
      alt: "좋아요 수",
      text: formatCount(likeCount),
    },
    {
      icon: "/public/images/comment.svg",
      alt: "댓글 수",
      text: formatCount(commentCount),
    },
    {
      icon: "/public/images/view.svg",
      alt: "조회수",
      text: formatCount(viewCount),
    },
  ];

  metaItems.forEach(({ icon, alt, text }) => {
    const item = document.createElement("div");
    item.className = "post-meta-item";

    const iconEl = document.createElement("img");
    iconEl.src = icon;
    iconEl.alt = alt;
    iconEl.className = "post-meta-icon";

    const textEl = document.createElement("span");
    textEl.textContent = text;

    item.append(iconEl, textEl);
    metaBox.appendChild(item);
  });

  const createdAtText = document.createElement("span");
  createdAtText.className = "post-meta-date";
  createdAtText.textContent = formatDateTime(createdAt);

  authorLeft.append(authorInfo, metaBox);

  authorBox.append(authorLeft, createdAtText);

  wrapper.append(contentContainer, authorBox);

  // 클릭 시 상세 페이지 이동
  wrapper.addEventListener("click", () => {
    window.location.href = `./post-detail.html?postId=${postId}`;
  });

  return wrapper;
};

const appendPosts = (posts) => {
  if (!listContainer || !posts || posts.length === 0) return;
  posts.forEach((post) => {
    const el = createPostElement(post);
    listContainer.appendChild(el);
  });
};

// API 호출 (페이지 단위)
const fetchPosts = async (page) => {
  if (isLoading || !hasNextPage) return;
  isLoading = true;

  try {
    const data = await fetchPostList({ page, pageSize, sort: currentSort });
    const posts = data?.content || [];

    appendPosts(posts);

    currentPage = data?.page ?? page;
    const totalPages = data?.totalPages ?? 1;
    hasNextPage = currentPage < totalPages;
  } catch (error) {
    console.error(error);
    hasNextPage = false;
    if (listContainer && listContainer.children.length === 0) {
      const err = document.createElement("p");
      err.textContent = "게시글 목록 조회 중 오류가 발생했습니다.";
      listContainer.appendChild(err);
    }
  } finally {
    isLoading = false;
  }
};

// 스크롤 80% 도달 시 다음 페이지 로드
const handleScroll = () => {
  if (!listContainer || scrollThrottle) return;
  scrollThrottle = true;
  window.requestAnimationFrame(() => {
    scrollThrottle = false;
    if (!hasNextPage || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listContainer;
    const threshold = scrollHeight * 0.8;

    if (scrollTop + clientHeight >= threshold) {
      fetchPosts(currentPage + 1);
    }
  });
};

const setupCreateButton = () => {
  if (!createButton) return;
  createButton.addEventListener("click", () => {
    window.location.href = "./post-create.html";
  });
};

const setupSortFilter = () => {
  if (!sortSelect || !listContainer) return;
  sortSelect.value = currentSort;
  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value || "NEW";
    currentPage = 1;
    hasNextPage = true;
    isLoading = false;
    listContainer.scrollTop = 0;
    listContainer.innerHTML = "";
    fetchPosts(1);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  setupCreateButton();
  setupSortFilter();
  fetchPosts(1);
  listContainer?.addEventListener("scroll", handleScroll);
});
