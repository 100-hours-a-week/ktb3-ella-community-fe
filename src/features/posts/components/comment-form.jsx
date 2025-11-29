import React from "react";
import { FaCommentDots } from "react-icons/fa6";
import Button from "@/components/common/button";

const CommentForm = ({ value, onChange, onSubmit, isSubmitting }) => {
  const isDisabled = !value.trim() || isSubmitting;

  return (
    <form className="post-comment-input-container" onSubmit={onSubmit}>
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
          value={value}
          onChange={onChange}
        ></textarea>
      </div>
      <div className="post-comment-btn">
        <Button
          type="submit"
          className="btn-comment-submit"
          disabled={isDisabled}
        >
          {isSubmitting ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
