import React, { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FaFilter, FaFire } from "react-icons/fa6";

import PostItem from "@/features/posts/components/post-item";
import { getPosts } from "@/features/posts/api/post-api";

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

const SORT_OPTIONS = [
  { value: "NEW", label: "최신순" },
  { value: "VIEW", label: "조회순" },
  { value: "LIKE", label: "좋아요순" },
  { value: "CMT", label: "댓글순" },
];

const ICON_COLOR = "#2563EB";

const PostList = () => {
  // 필터 및 검색 상태
  const [sortOption, setSortOption] = useState("NEW");
  const [keyword, setKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage, // 다음 페이지 로딩 중인지 여부
    status,
  } = useInfiniteQuery({
    // queryKey에 검색조건을 포함시키면, 조건이 바뀔 때 알아서 리셋하고 다시 불러옴
    queryKey: ["posts", sortOption, searchQuery],

    queryFn: async ({ pageParam = 1 }) => {
      const response = await getPosts({
        page: pageParam,
        size: 10,
        sort: sortOption,
      });
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = lastPage.page ?? allPages.length;
      const totalPages = lastPage.totalPages ?? 1;

      // 현재 페이지가 전체 페이지보다 작으면 다음 페이지 번호 반환, 아니면 종료
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },

    staleTime: 1000 * 60,
  });

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 타겟이 보이고 && 다음 페이지가 있고 && 현재 로딩중이 아닐 때
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 이벤트 핸들러
  const handleSortChange = (e) => setSortOption(e.target.value);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") setSearchQuery(keyword);
  };

  const handleTagClick = (tag) => {
    setKeyword(tag);
    setSearchQuery(tag);
  };

  const allPosts = data?.pages.flatMap((page) => page.content) || [];

  const isLoading = status === "pending";

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
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                로딩 중...
              </div>
            ) : allPosts.length > 0 ? (
              allPosts.map((post) => <PostItem key={post.postId} post={post} />)
            ) : (
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
          {!isLoading && hasNextPage && (
            <div
              ref={observerTarget}
              className="post-list-sentinel"
              style={{
                height: "40px",
                textAlign: "center",
                clear: "both",
                padding: "10px",
              }}
            >
              {isFetchingNextPage && <p>데이터를 더 불러오는 중...</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PostList;
