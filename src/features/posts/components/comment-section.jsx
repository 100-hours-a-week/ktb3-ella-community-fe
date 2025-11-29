import React, { useState } from "react";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/features/posts/api/comment-api.js";
import Button from "@/components/common/button";
import Modal from "@/components/common/modal";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import CommentItem from "./comment-item";
import { FaCommentDots } from "react-icons/fa6";

const CommentSection = ({ postId }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [commentInput, setCommentInput] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // 댓글 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId, page],
    queryFn: () => getComments({ postId, page }),
    placeholderData: keepPreviousData,
  });

  const comments = data?.content || [];
  const totalPages = data?.totalPages || 1;

  // 댓글 등록
  const createMutation = useMutation({
    mutationFn: (content) => createComment({ postId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      setCommentInput(""); // 입력창 초기화
      setPage(1); // 첫 페이지로 이동해서 내 댓글 확인
    },
    onError: () => alert("댓글 등록에 실패했습니다."),
  });

  // 댓글 수정
  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }) =>
      updateComment({ commentId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
    },
    onError: (error) => {
      if (error.status === 403) alert("수정 권한이 없습니다.");
      else alert("댓글 수정 실패");
    },
  });

  // 댓글 삭제
  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteComment({ commentId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      if (error.status === 403) alert("삭제 권한이 없습니다.");
      else alert("댓글 삭제 실패");
    },
  });

  // 핸들러 함수
  const handlePageChange = (targetPage) => {
    if (targetPage !== page) setPage(targetPage);
  };

  // 등록 핸들러
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    createMutation.mutate(commentInput);
  };

  // 수정 핸들러
  const handleUpdateComment = (commentId, content) => {
    updateMutation.mutate({ commentId, content });
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = (commentId) => {
    setPendingDeleteId(commentId);
    setIsDeleteModalOpen(true);
  };

  // 삭제 모달 확인 핸들러
  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      deleteMutation.mutate(pendingDeleteId);
    }
  };

  return (
    <div className="post-comments-section">
      {/* 댓글 입력 폼 */}
      <form
        className="post-comment-input-container"
        onSubmit={handleCreateSubmit}
      >
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
            disabled={!commentInput.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "등록 중..." : "댓글 등록"}
          </Button>
        </div>
      </form>

      {/* 댓글 목록 리스트 */}
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

      {/* 페이지네이션 */}
      <div className="comments-pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`comments-page-btn ${p === page ? "active" : ""}`}
            onClick={() => handlePageChange(p)}
            disabled={isLoading}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 삭제 모달 */}
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
