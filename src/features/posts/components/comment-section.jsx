import React, { useState, useEffect } from "react";
import { formatDateTime } from "@/shared/utils/format";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/features/posts/api/comment-api.js";
import { FaPen, FaTrash, FaCommentDots } from "react-icons/fa6";
import Button from "@/components/common/button";
import Modal from "@/components/common/modal";

const CommentSection = ({ postId, initialCount }) => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [commentInput, setCommentInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // 댓글 불러오기
  const loadComments = async (pageNum) => {
    try {
      const data = await getComments({ postId, page: pageNum });
      setComments(data.content || []);
      setPage(data.page);
      setTotalPages(data.totalPages ?? 1);
    } catch (error) {
      console.error("댓글 로딩 실패", error);
    }
  };

  useEffect(() => {
    loadComments(1);
  }, [postId]);

  // 댓글 등록/수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      if (editingId) {
        await updateComment({ commentId: editingId, content: commentInput });
        setEditingId(null);
      } else {
        await createComment({ postId, content: commentInput });
      }
      setCommentInput("");
      loadComments(1);
    } catch (error) {
      if (error.status === 403) {
        alert("해당 댓글에 대한 수정 권한이 없습니다.");
      } else {
        alert("댓글 저장을 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 삭제 핸들러
  const handleDeleteBtnClick = (commentId) => {
    setPendingDeleteId(commentId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteComment({ commentId: pendingDeleteId });
      loadComments(1);
    } catch (error) {
      if (error.status === 403) {
        alert("해당 댓글에 대한 삭제 권한이 없습니다.");
      } else {
        alert("삭제에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  // 수정 모드 진입
  const startEdit = (comment) => {
    setEditingId(comment.commentId);
    setCommentInput(comment.content);
  };

  return (
    <div className="post-comments-section">
      {/* 댓글 입력 폼 */}
      <form className="post-comment-input-container" onSubmit={handleSubmit}>
        <div className="post-comment-input-label">
          <FaCommentDots size={24} color="#2563EB" />
          <label htmlFor="post-comment-input" className="field_label">
            댓글
          </label>
        </div>
        <div className="post-comment-input-box">
          <textarea
            className="post-comment-input"
            id="post-comment-input"
            placeholder="댓글을 남겨주세요!"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          ></textarea>
        </div>
        <div className="post-comment-btn">
          <Button
            type="submit"
            className="btn-comment-submit"
            disabled={!commentInput.trim()}
          >
            {editingId ? "댓글 수정" : "댓글 등록"}
          </Button>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="post-comments-list-container">
        {comments.length === 0 ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#888" }}>
            첫 댓글을 남겨보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.commentId} className="post-comment-list">
              <div className="post-comment-list-info">
                <div className="post-comment-info-container">
                  <div className="profile-img">
                    {comment.author?.profileImageUrl ? (
                      <img
                        src={comment.author.profileImageUrl}
                        width="62"
                        height="62"
                        alt="작성자"
                      />
                    ) : (
                      <FaUserCircle size={30} color="#d1d5db" />
                    )}
                  </div>
                  <div className="post-comment-content">
                    <div className="post-comment-detail-top">
                      <p className="post-author-name">
                        {comment.author?.nickname || "익명"}
                      </p>
                      <p className="post-created-at">
                        {formatDateTime(comment.createdAt)}
                      </p>

                      <div className="post-comment-actions">
                        <button
                          type="button"
                          className="btn-comment-edit"
                          onClick={() => startEdit(comment)}
                        >
                          <FaPen size={12} color="#9CA3AF" /> <span>수정</span>
                        </button>
                        <button
                          type="button"
                          className="btn-comment-delete"
                          onClick={() =>
                            handleDeleteBtnClick(comment.commentId)
                          }
                        >
                          <FaTrash size={12} color="#9CA3AF" />{" "}
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>
                    <div className="post-comment-text-container">
                      <p className="post-comment-text">{comment.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이징 */}
      <div className="comments-pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`comments-page-btn ${p === page ? "active" : ""}`}
            onClick={() => loadComments(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="댓글을 삭제하시겠습니까?"
        description="삭제된 내용은 복구할 수 없습니다."
      />
    </div>
  );
};

export default CommentSection;
