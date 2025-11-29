import React from "react";

const CommentPagination = ({
  totalPages,
  currentPage,
  onPageChange,
  disabled,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="comments-pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          className={`comments-page-btn ${page === currentPage ? "active" : ""}`}
          onClick={() => onPageChange(page)}
          disabled={disabled}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default CommentPagination;
