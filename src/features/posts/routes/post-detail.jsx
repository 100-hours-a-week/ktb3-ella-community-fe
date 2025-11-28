import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaRegCommentDots,
  FaRegEye,
  FaShareNodes,
  FaPen,
  FaTrash,
} from "react-icons/fa6";

import { likePost, unlikePost } from "@/features/posts/api/like-api";

import { getPost, deletePost } from "@/features/posts/api/post-api";
import { formatDateTime, formatCount } from "@/shared/utils/format";
import { useAuthStore } from "@/shared/stores/use-auth-store";

import MarkdownRenderer from "@/features/posts/components/markdown-renderer";
import CommentSection from "@/features/posts/components/comment-section";
import Modal from "@/components/common/modal";

import "@/styles/pages/post-detail.css";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
    }
  }, [user, navigate]);

  // 게시글 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPost(postId);
        setPost(data);
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      } catch (error) {
        alert("게시글을 불러올 수 없습니다. 다시 시도해주세요.");
        console.error(error.message);
        navigate("/posts");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId, navigate]);

  // 좋아요 토글
  const handleLikeToggle = async () => {
    if (!user) return null;
    try {
      if (liked) {
        await unlikePost(postId);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await likePost(postId);
        setLikeCount((prev) => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error(error);
    }
  };

  // 삭제 핸들러
  const handleDeleteBtnClick = (postId) => {
    setPendingDeleteId(postId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePost({ postId: pendingDeleteId });
      navigate("/posts");
    } catch (error) {
      if (error.status === 403) {
        alert("해당 게시글에 대한 삭제 권한이 없습니다.");
      } else {
        alert("삭제에 실패했습니다. 다시 시도해주세요.");
      }
      console.error(error.message);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  // 공유 핸들러
  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("링크가 복사되었습니다.");
    } catch (err) {
      alert("공유에 실패했습니다. 다시 시도해주세요.");
      console.error(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!post) return null;

  const isAuthor = user?.userId === post.author?.userId;

  return (
    <div className="page-post-detail">
      <div className="spacer-lg">
        <div className="post-detail">
          {/* 헤더 */}
          <div className="post-detail-header">
            <h1 className="post-detail-title">{post.title}</h1>
            {isAuthor && (
              <div className="post-update-delete-btns">
                <button
                  type="button"
                  className="btn-update"
                  onClick={() => navigate(`/posts/${postId}/edit`)}
                >
                  <FaPen size={14} style={{ marginRight: 4 }} />
                  수정
                </button>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => handleDeleteBtnClick(post.postId)}
                >
                  <FaTrash size={14} style={{ marginRight: 4 }} />
                  삭제
                </button>
              </div>
            )}
          </div>

          {/* 작성자 정보 */}
          <div className="post-detail-title-container">
            <div className="post-detail-title-info">
              <div className="profile-img">
                <img
                  className="post-author-avatar"
                  src={
                    post.author?.profileImageUrl || "/images/userProfile.png"
                  }
                  alt="작성자"
                />
              </div>
              <div className="post-author-name-date">
                <p className="post-author-name">
                  {post.author?.nickname || "알 수 없음"}
                </p>
                <p className="post-created-at">
                  {formatDateTime(post.createdAt)}
                </p>
              </div>
            </div>

            <div className="post-count">
              <FaRegHeart size={14} color="#6B7280" />
              <p className="post-like-count-value">{formatCount(likeCount)}</p>

              <FaRegCommentDots size={14} color="#6B7280" />
              <p className="post-comment-count-value">
                {formatCount(post.commentCount)}
              </p>

              <FaRegEye size={14} color="#6B7280" />
              <p className="post-view-count-value">
                {formatCount(post.viewCount)}
              </p>
            </div>
          </div>

          {/* 본문 내용 */}
          <div className="post-detail-content-container">
            {post.postImageUrl && (
              <div className="post-img">
                <img
                  className="post-main-image is-loaded"
                  src={post.postImageUrl}
                  alt="게시글 이미지"
                />
              </div>
            )}

            <MarkdownRenderer content={post.content} />

            <div className="post-btn">
              <button
                type="button"
                className={`btn-like ${liked ? "active" : ""}`}
                onClick={handleLikeToggle}
              >
                {liked ? <FaHeart color="#fff" /> : <FaRegHeart />}
                <span className="btn-like-text">좋아요</span>
                <p className="post-like-count-value">
                  {formatCount(likeCount)}
                </p>
              </button>

              <button type="button" className="btn-share" onClick={handleShare}>
                <FaShareNodes />
                <span className="btn-share-text">공유</span>
              </button>
            </div>

            {/* 댓글 섹션 컴포넌트 */}
            <CommentSection postId={postId} initialCount={post.commentCount} />
          </div>
        </div>

        <div className="post-author">
          <div className="author-profile-image">
            <div className="author-profile-image-border">
              <div className="profile-img">
                {post.author?.profileImageUrl ? (
                  <img
                    src={post.author.profileImageUrl}
                    width="62"
                    height="62"
                    alt="작성자"
                  />
                ) : (
                  <FaUserCircle size={30} color="#d1d5db" />
                )}
              </div>
              <div className="author-info">
                <p className="author-name">{post.author?.nickname}</p>
                <p className="author-bio">
                  {post.author?.bio || "Backend Developer"}
                </p>
              </div>
            </div>

            <div className="author-stats">
              <div className="author-stat">
                <p className="author-stat-label">게시글</p>
                <p className="author-stat-value">150</p>
              </div>
              <div className="author-stat">
                <p className="author-stat-label">팔로워</p>
                <p className="author-stat-value">300</p>
              </div>
              <div className="author-stat">
                <p className="author-stat-label">팔로잉</p>
                <p className="author-stat-value">180</p>
              </div>
            </div>

            <button type="button" className="follow-button">
              팔로우
            </button>
          </div>

          <div className="relative-post">
            <h2 className="relative-post-title">관련 게시글</h2>
            <div className="relative-post-list">
              <div className="relative-post-item">
                <p className="relative-post-item-title">준비 중입니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="게시글을 삭제하시겠습니까?"
        description="삭제된 내용은 복구할 수 없습니다."
      />
    </div>
  );
};

export default PostDetail;
