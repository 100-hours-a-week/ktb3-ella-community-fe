import React, { useCallback, useState } from "react";
import Modal from "@/components/common/modal";
import { useComments } from "@/features/posts/hooks/use-comments.js";
import CommentForm from "./comment-form";
import CommentItem from "./comment-item";
import CommentPagination from "./comment-pagination";

const CommentSection = ({ postId }) => {
  const {
    page,
    setPage,
    comments,
    totalPages,
    isLoading,
    createComment,
    isCreating,
    updateComment,
    deleteComment,
  } = useComments(postId);

  const [commentInput, setCommentInput] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handlePageChange = useCallback(
    (targetPage) => {
      if (targetPage !== page) setPage(targetPage);
    },
    [page, setPage]
  );

  const handleCreateSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!commentInput.trim()) return;
      createComment(commentInput, {
        onSuccess: () => setCommentInput(""),
      });
    },
    [commentInput, createComment]
  );

  const handleUpdateComment = useCallback(
    (commentId, content) => {
      updateComment({ commentId, content });
    },
    [updateComment]
  );

  const handleDeleteClick = useCallback((commentId) => {
    setPendingDeleteId(commentId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDeleteId) return;
    deleteComment(pendingDeleteId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setPendingDeleteId(null);
      },
    });
  }, [deleteComment, pendingDeleteId]);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setPendingDeleteId(null);
  }, []);

  return (
    <div className="post-comments-section">
      <CommentForm
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isCreating}
      />

      <div className="post-comments-list-container">
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            댓글을 불러오는 중입니다...
          </div>
        ) : comments.length === 0 ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#888" }}>
            첫 댓글을 남겨보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>

      <CommentPagination
        totalPages={totalPages}
        currentPage={page}
        onPageChange={handlePageChange}
        disabled={isLoading}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleConfirmDelete}
        title="댓글을 삭제하시겠습니까?"
        description="삭제된 내용은 복구할 수 없습니다."
      />
    </div>
  );
};

export default CommentSection;
