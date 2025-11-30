import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import PostForm from "@/features/posts/components/post-form"; 
import { getPost } from "@/features/posts/api/post-api";

const PostUpdate = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    staleTime: 1000 * 60,
    retry: 0,
  });

  useEffect(() => {
    if (isError) {
      alert("게시글 정보를 불러올 수 없습니다.");
      navigate("/posts");
    }
  }, [isError, navigate]);

  if (isLoading) return <div className="loading">Loading...</div>;
  if (!post) return null;

  return (
    <div className="page-post-form">
      <div className="spacer-lg">
        <PostForm postId={postId} initialData={post} />
      </div>
    </div>
  );
};

export default PostUpdate;
