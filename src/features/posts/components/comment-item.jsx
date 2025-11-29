import React, { useState, memo } from "react";
import { formatDateTime } from "@/shared/utils/format";
import { FaPen, FaTrash } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import "@/styles/components/comment-item.css";

const CommentItem = ({ comment, onUpdate, onDelete, isOwner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  // 수정 버튼 클릭 시
  const handleEditClick = () => {
    if (!isOwner) return;
    setIsEditing(true);
    setEditContent(comment.content);
  };

  // 수정 완료
  const handleSaveClick = () => {
    if (!isOwner) return;
    if (editContent.trim() === "") return;
    onUpdate(comment.commentId, editContent); // 부모에게 데이터 전달
    setIsEditing(false);
  };

  // 수정 취소
  const handleCancelClick = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSaveClick();
    }
    if (e.key === "Escape") {
      handleCancelClick();
    }
  };

  return (
    <div className="post-comment-list">
      <div className="post-comment-list-info">
        <div className="post-comment-info-container">
          {/* 프로필 이미지 */}
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
              {isOwner && !isEditing && (
                <div className="post-comment-actions">
                  <button
                    type="button"
                    className="btn-comment-edit"
                    onClick={handleEditClick}
                  >
                    <FaPen size={12} color="#9CA3AF" /> <span>수정</span>
                  </button>
                  <button
                    type="button"
                    className="btn-comment-delete"
                    onClick={() => onDelete(comment.commentId)}
                  >
                    <FaTrash size={12} color="#9CA3AF" /> <span>삭제</span>
                  </button>
                </div>
              )}
            </div>

            <div className="post-comment-text-container">
              {isEditing ? (
                <div className="comment-edit-wrapper">
                  <textarea
                    className="comment-edit-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus // 수정 모드 진입 시 자동 포커스
                  />
                  <div className="comment-edit-footer">
                    <span className="comment-edit-guide">
                      Enter + Ctrl 저장
                    </span>
                    <div className="comment-edit-btns">
                      <button
                        onClick={handleCancelClick}
                        className="btn-edit-cancel"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveClick}
                        className="btn-edit-save"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="post-comment-text">{comment.content}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(CommentItem);
