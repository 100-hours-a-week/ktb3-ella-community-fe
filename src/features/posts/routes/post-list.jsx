import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilter, FaFire } from "react-icons/fa6";

import PostItem from "@/features/posts/components/post-item";
import { getPosts } from "@/features/posts/api/post-api";
import { useAuthStore } from "@/shared/stores/use-auth-store";

import "@/styles/global.css";
import "@/styles/components/post-form.css";
import "@/styles/pages/post-list.css";

const POPULAR_TAGS = [
  "#JavaScript",
  "#HTML",
  "#CSS",
  "#React",
  "#Node.js",
  "#Vue.js",
  "#Angular",
  "#TypeScript",
];

const ICON_COLOR = "#2563EB";

const PostList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 필터 및 검색 상태
  const [sortOption, setSortOption] = useState("NEW");
  const [keyword, setKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const isLoadingRef = useRef(false); // 함수 재생성 방지 및 중복 호출 차단
  const observerTarget = useRef(null); // 무한 스크롤 감지 타겟

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
    }
  }, [user, navigate]);

  const loadPosts = useCallback(
    async (pageNum) => {
      // 로딩 중이거나 다음 페이지가 없으면 중단
      if (isLoadingRef.current || !hasNextPage) return;

      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        const data = await getPosts({
          page: pageNum,
          size: 10,
          sort: sortOption,
        });

        const newPosts = data?.content || [];
        const totalPages = data?.totalPages ?? 1;

        setPosts((prev) => (pageNum === 1 ? newPosts : [...prev, ...newPosts]));
        setHasNextPage(pageNum < totalPages);

        if (pageNum < totalPages) {
          setPage(pageNum + 1);
        }
      } catch (error) {
        console.error("게시글 로딩 실패:", error);
        // 에러 발생 시 다음 페이지 로딩 중단
        setHasNextPage(false);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    },
    [sortOption, hasNextPage, searchQuery]
  );

  // 필터 바뀌면 리스트 초기화 후 첫 페이지 로드
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasNextPage(true);
    isLoadingRef.current = false;
    loadPosts(1);
  }, [sortOption, searchQuery]);

  // Intersection Observer
  useEffect(() => {
    if (!observerTarget.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current) {
          loadPosts(page);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [hasNextPage, page, loadPosts]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setSearchQuery(keyword);
    }
  };

  const handleTagClick = (tag) => {
    setKeyword(tag);
    setSearchQuery(tag);
  };

  return (
    <div
      className="page-post-list post-layout"
      style={{ width: "100%", flex: 1 }}
    >
      <div className="spacer-lg">
        <div className="spacer">
          <div className="post-filter">
            <div className="field-label-wrapper">
              <FaFilter
                color={ICON_COLOR}
                size={18}
                style={{ marginRight: "8px" }}
              />
              <label htmlFor="filter" className="field_label">
                필터
              </label>
            </div>
            <p className="filter-label-title">정렬순</p>
            <select
              className="post-filter-select"
              id="filter"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="NEW">최신순</option>
              <option value="VIEW">조회순</option>
              <option value="LIKE">좋아요순</option>
              <option value="CMT">댓글순</option>
            </select>
          </div>

          <div className="popular-post-filter">
            <div className="field-label-wrapper">
              <FaFire
                color={ICON_COLOR}
                size={18}
                style={{ marginRight: "8px" }}
              />
              <span className="field_label">인기 태그</span>
            </div>
            <div className="popular-post-tags-wrapper">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="popular-post-tag"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 메인 리스트 */}
        <section className="post-list">
          <div className="post-list-header">
            <p className="post-list-title">게시글 목록</p>
            <input
              type="text"
              className="post-list-search-input"
              placeholder="게시글 검색.."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <div className="post-list-content-wrapper">
            {posts.length > 0
              ? posts.map((post) => <PostItem key={post.postId} post={post} />)
              : !isInitialLoading &&
                !isLoading && (
                  <p
                    className="no-posts-message"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#6b7280",
                    }}
                  >
                    등록된 게시글이 없습니다.
                  </p>
                )}
          </div>

          {hasNextPage && (
            <div
              ref={observerTarget}
              className="post-list-sentinel"
              style={{ height: "20px", textAlign: "center", clear: "both" }}
            >
              {isLoading && <p>로딩 중...</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PostList;
