import React from "react";
import { formatDateTime, formatCount } from "@/shared/utils/format";
import { Link } from "react-router-dom";

import { FaHeart, FaRegCommentDots, FaRegEye } from "react-icons/fa6";

import "@/styles/components/post-form.css";
import "@/styles/pages/post-list.css";

const PostItem = ({ post }) => {
  const {
    postId,
    title,
    author,
    likeCount,
    viewCount,
    commentCount,
    createdAt,
    tags = ["React", "JavaScript"],
  } = post;

  const profileImageUrl = author?.profileImageUrl;

  const ICON_COLOR = "#2563EB";

  const metaItems = [
    {
      Icon: FaHeart,
      label: "좋아요 수",
      text: formatCount(likeCount),
    },
    {
      Icon: FaRegCommentDots,
      label: "댓글 수",
      text: formatCount(commentCount),
    },
    {
      Icon: FaRegEye,
      label: "조회수",
      text: formatCount(viewCount),
    },
  ];

  return (
    <Link to={`/posts/${postId}`} className="post-list-content">
      <div className="post-list-content-container">
        <div className="post-tags">
          {tags.map((tag, index) => (
            <span key={index} className="post-tag">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="post-title">{title}</h1>
      </div>

      <div className="author-profile">
        <div className="author-left">
          <div className="author-info">
            <div className="author-profile-image">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="작성자 아이콘" loading="lazy" />
              ) : (
                <div className="profile-placeholder" />
              )}
            </div>
            <strong>{(author && author.nickname) || "알 수 없음"}</strong>
          </div>

          <div className="post-meta">
            {metaItems.map((item, index) => (
              <div key={index} className="post-meta-item">
                <item.Icon
                  color={ICON_COLOR}
                  className="post-meta-icon"
                  aria-label={item.label}
                />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <span className="post-meta-date">{formatDateTime(createdAt)}</span>
      </div>
    </Link>
  );
};

export default PostItem;
